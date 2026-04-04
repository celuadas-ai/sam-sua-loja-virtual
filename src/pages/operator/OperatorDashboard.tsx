import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Phone, CheckCircle, Clock, Truck, LogOut, ChevronDown, ChevronUp, CreditCard, ShoppingBag, Loader2, Navigation, Route, MapPinned, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { OrderStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import samLogo from '@/assets/sam-logo.png';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useDriverPosition } from '@/hooks/useDriverPosition';

import { useStores } from '@/hooks/useStores';
import { haversineDistance, getDeliveryPriority, extractNeighborhood } from '@/utils/distance';
import { OrderRouteMap } from '@/components/operator/OrderRouteMap';

const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
  received: { label: 'Recebido', color: 'bg-blue-500', next: 'preparing' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500', next: 'on_the_way' },
  on_the_way: { label: 'Em Rota', color: 'bg-orange-500', next: 'almost_there' },
  almost_there: { label: 'Quase Lá', color: 'bg-purple-500', next: 'delivered' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
};

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { orders: allOrders, loading, updateOrderStatus, confirmPayment } = useOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [stockManagerOpen, setStockManagerOpen] = useState(false);
  const [mapOrderId, setMapOrderId] = useState<string | null>(null);
  const { isTracking, startTracking, stopTracking } = useDriverPosition();
  const { stores } = useStores();

  // Compute distance info for each order from nearest store
  const orderDistances = useMemo(() => {
    if (stores.length === 0) return {};
    const map: Record<string, { distance: number; storeName: string; storeCoords: { lat: number; lng: number }; neighborhood: string; priority: ReturnType<typeof getDeliveryPriority>; eta: string; customerCoords: { lat: number; lng: number } | null }> = {};
    
    for (const order of allOrders) {
      if (!order.customerAddress) continue;

      const neighborhood = extractNeighborhood(order.customerAddress || '');
      
      // Check if order has real coordinates
      const hasCoords = order.customerLatitude && order.customerLongitude;
      
      let nearestStore = stores[0];
      let minDist = 0;
      let customerCoords: { lat: number; lng: number } | null = null;

      if (hasCoords) {
        customerCoords = { lat: Number(order.customerLatitude), lng: Number(order.customerLongitude) };
        minDist = Infinity;
        
        for (const store of stores) {
          const dist = haversineDistance(
            customerCoords.lat, customerCoords.lng,
            store.latitude, store.longitude
          );
          if (dist < minDist) {
            minDist = dist;
            nearestStore = store;
          }
        }
      }

      // Estimate delivery time: ~3 min/km + 10 min preparation
      const etaMinutes = hasCoords ? Math.round(minDist * 3 + 10) : 30;
      const eta = etaMinutes >= 60 
        ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}min`
        : `${etaMinutes} min`;

      map[order.id] = {
        distance: Math.round(minDist * 10) / 10,
        storeName: nearestStore.name,
        storeCoords: { lat: nearestStore.latitude, lng: nearestStore.longitude },
        neighborhood,
        priority: getDeliveryPriority(minDist),
        eta,
        customerCoords,
      };
    }
    return map;
  }, [allOrders, stores]);

  // Filter to show only non-delivered orders
  // Show non-delivered orders + delivered but unpaid orders
  const orders = allOrders.filter((o) => o.status !== 'delivered' || o.paymentStatus !== 'paid');
  const deliveredToday = allOrders.filter((o) => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return o.status === 'delivered' && 
      orderDate.toDateString() === today.toDateString();
  }).length;

  const handleAdvanceStatus = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const nextStatus = statusConfig[order.status].next;
    if (nextStatus) {
      const success = await updateOrderStatus(orderId, nextStatus);
      if (success) {
        toast.success(`Estado atualizado para: ${statusConfig[nextStatus].label}`);
      } else {
        toast.error('Erro ao atualizar estado');
      }
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    const success = await confirmPayment(orderId);
    if (success) {
      toast.success('Pagamento confirmado com sucesso!');
    } else {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const handleToggleTracking = async (orderId: string) => {
    if (trackingOrderId === orderId && isTracking) {
      await stopTracking(orderId);
      setTrackingOrderId(null);
      toast.success('Rastreio GPS desativado');
    } else {
      if (trackingOrderId && isTracking) {
        await stopTracking(trackingOrderId);
      }
      await startTracking(orderId);
      setTrackingOrderId(orderId);
      toast.success('Rastreio GPS ativado - sua posição está sendo enviada em tempo real');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl p-1.5">
              <img src={samLogo} alt="SAM" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Operador</h1>
              <p className="text-xs text-muted-foreground">{user?.user_metadata?.full_name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStockManagerOpen(true)}
              className="gap-1"
            >
              <Boxes className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="sam-card p-4 text-center">
          <Clock className="w-6 h-6 mx-auto text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="sam-card p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto text-sam-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{deliveredToday}</p>
          <p className="text-xs text-muted-foreground">Hoje</p>
        </div>
      </div>

      {/* Orders */}
      <div className="p-4 space-y-4">
        <h2 className="font-semibold text-foreground">Encomendas Ativas</h2>
        
        {loading ? (
          <div className="sam-card p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">A carregar encomendas...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="sam-card p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Sem encomendas pendentes</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const status = statusConfig[order.status];
            const isExpanded = expandedOrderId === order.id;
            const isPaid = order.paymentStatus === 'paid';
            const distInfo = orderDistances[order.id];
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="sam-card overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-semibold text-foreground text-sm">{order.id.slice(0, 8)}...</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs text-white ${status.color}`}>
                          {status.label}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          isPaid 
                            ? 'bg-green-500 text-white' 
                            : 'bg-amber-500 text-white'
                        }`}>
                          {isPaid ? 'Pago' : 'Pendente'}
                        </span>
                        {distInfo && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs text-white ${distInfo.priority.color}`}>
                            {distInfo.priority.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-foreground">{order.total.toLocaleString()} MZN</p>
                  </div>

                  {/* Enriched order details */}
                  {distInfo && (
                    <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-muted/50 text-xs flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPinned className="w-3.5 h-3.5 text-accent" />
                        <span className="text-foreground font-medium">{distInfo.neighborhood}</span>
                      </div>
                      {distInfo.distance > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Route className="w-3.5 h-3.5" />
                          <span>{distInfo.distance} km</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ETA: {distInfo.eta}</span>
                      </div>
                      {distInfo.storeName && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Package className="w-3.5 h-3.5" />
                          <span>{distInfo.storeName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{order.customerName || 'Cliente'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{order.customerPhone || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground flex-1">{order.customerAddress || 'N/A'}</span>
                      {order.customerAddress && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-accent hover:text-accent/80"
                            onClick={() => {
                              const encodedAddress = encodeURIComponent(order.customerAddress!);
                              window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                            }}
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Mapa
                          </Button>
                          {distInfo?.storeName && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                              onClick={() => {
                                const store = stores.find(s => s.name === distInfo.storeName);
                                if (store) {
                                  const origin = `${store.latitude},${store.longitude}`;
                                  const dest = encodeURIComponent(order.customerAddress!);
                                  window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, '_blank');
                                }
                              }}
                            >
                              <Route className="w-3 h-3 mr-1" />
                              Rota
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Map Toggle */}
                  {distInfo?.customerCoords && (
                    <div className="mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 mb-2"
                        onClick={() => setMapOrderId(prev => prev === order.id ? null : order.id)}
                      >
                        <Map className="w-4 h-4" />
                        {mapOrderId === order.id ? 'Esconder Mapa' : 'Ver Rota no Mapa'}
                      </Button>
                      <AnimatePresence>
                        {mapOrderId === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <OrderRouteMap
                              storeCoords={distInfo.storeCoords}
                              customerCoords={distInfo.customerCoords}
                              storeName={distInfo.storeName}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Expand/Collapse Products Button */}
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors w-full justify-center py-2 border-t border-border"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ver produtos ({order.items.length})</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expandable Products Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-muted/30 p-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Produtos da Encomenda</h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="flex items-center gap-3 bg-card rounded-lg p-2">
                              <div className="w-12 h-12 bg-background rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.brand} • {item.volume}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-foreground">
                                  {(item.price * item.minQuantity * item.quantity).toLocaleString()} MZN
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × {item.minQuantity} {item.unitLabel}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Summary */}
                        <div className="mt-4 pt-3 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total da encomenda</span>
                            <span className="font-bold text-foreground">{order.total.toLocaleString()} MZN</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">Método de pagamento</span>
                            <span className="text-sm text-foreground uppercase">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  {/* GPS Tracking Button - Show for on_the_way and almost_there */}
                  {(order.status === 'on_the_way' || order.status === 'almost_there') && (
                    <Button 
                      variant={trackingOrderId === order.id && isTracking ? "destructive" : "outline"}
                      className={`w-full gap-2 ${trackingOrderId === order.id && isTracking 
                        ? '' 
                        : 'border-accent text-accent hover:bg-accent/10'}`}
                      onClick={() => handleToggleTracking(order.id)}
                    >
                      <Navigation className="w-4 h-4" />
                      {trackingOrderId === order.id && isTracking 
                        ? 'Parar Rastreio GPS' 
                        : 'Iniciar Rastreio GPS'}
                    </Button>
                  )}

                  {/* Advance status button - delivery allowed without payment */}
                  {status.next && (
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => handleAdvanceStatus(order.id)}
                    >
                      <Truck className="w-4 h-4" />
                      {status.next === 'preparing' && 'Iniciar Preparação'}
                      {status.next === 'on_the_way' && 'Saiu para Entrega'}
                      {status.next === 'almost_there' && 'Quase a Chegar'}
                      {status.next === 'delivered' && 'Confirmar Entrega'}
                    </Button>
                  )}

                  {/* Confirm Payment Button - Show after delivery for unpaid orders */}
                  {!isPaid && order.status === 'delivered' && (
                    <Button 
                      variant="outline"
                      className="w-full gap-2 border-sam-success text-sam-success hover:bg-sam-success/10"
                      onClick={() => handleConfirmPayment(order.id)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Confirmar Pagamento
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Stock Manager Modal */}
      <AnimatePresence>
        {stockManagerOpen && (
          <OperatorStockManager
            isOpen={stockManagerOpen}
            onClose={() => setStockManagerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
