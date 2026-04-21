import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, Phone, Mail, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';

const faqItems = [
  {
    question: 'Como faço uma encomenda?',
    answer: 'Navegue pelos produtos, adicione ao carrinho e finalize o pagamento. A entrega será feita no endereço registado.',
  },
  {
    question: 'Quais são os métodos de pagamento?',
    answer: 'Aceitamos M-Pesa, e-Mola, POS e dinheiro na entrega.',
  },
  {
    question: 'Qual é o tempo de entrega?',
    answer: 'As entregas são feitas em até 30 minutos na área de Maputo.',
  },
  {
    question: 'Posso cancelar uma encomenda?',
    answer: 'Sim, pode cancelar desde que o estado seja "Recebido". Depois de iniciada a preparação, não é possível cancelar.',
  },
];

const contactOptions = [
  { icon: Phone, label: 'Ligar', value: '+258 84 000 0000', action: 'tel:+25884000000' },
  { icon: Mail, label: 'Email', value: 'suporte@sam.mz', action: 'mailto:suporte@sam.mz' },
];

export default function HelpPage() {
  const { toast } = useToast();

  const handleContact = (action: string) => {
    window.open(action, '_blank');
    toast({ title: 'A abrir...', description: 'A redirecionar para o contacto' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Ajuda" showBack />

      <div className="px-4 py-4 space-y-6">
        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="sam-card p-4"
              >
                <h3 className="font-medium text-foreground mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contactos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Precisa de mais ajuda?</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => handleContact(option.action)}
                  className="sam-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.value}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Horário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sam-card p-4 text-center"
        >
          <p className="text-sm text-muted-foreground">Horário de atendimento</p>
          <p className="font-semibold text-foreground">Segunda a Sábado, 7h às 20h</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
