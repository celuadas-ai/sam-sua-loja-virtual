import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Mail, Phone, AlertTriangle, Clock } from 'lucide-react';

export default function DeleteAccountPage() {
  const { user } = useAuth();

  const subject = 'Pedido de eliminação de conta e dados pessoais - SAM';
  const body = [
    'Exmos. Senhores,',
    '',
    'Venho por este meio solicitar a eliminação da minha conta e dos dados pessoais associados na plataforma SAM - Sua Loja Virtual, nos termos da legislação aplicável em matéria de proteção de dados.',
    '',
    user?.email ? `Email registado: ${user.email}` : 'Email registado: ',
    user?.user_metadata?.phone ? `Telemóvel: ${user.user_metadata.phone}` : 'Telemóvel: ',
    '',
    'Solicito que me seja confirmada a eliminação no prazo legalmente previsto.',
    '',
    'Com os melhores cumprimentos,',
    '',
    '[O seu nome completo]',
  ].join('%0D%0A');

  const mailtoHref = `mailto:geral@sam.co.mz?subject=${encodeURIComponent(subject)}&body=${body}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Eliminar Conta" showBack />
      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto space-y-6 text-foreground text-sm leading-relaxed">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Eliminação de Conta e Dados</h1>
          <p className="text-muted-foreground">
            Pode solicitar a eliminação da sua conta e dos dados pessoais associados a qualquer momento.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            O que acontece quando pede a eliminação?
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>A sua conta de utilizador será desactivada e removida.</li>
            <li>Os seus dados pessoais (nome, email, telefone, NUIT, moradas e coordenadas) serão apagados.</li>
            <li>O histórico de encomendas será anonimizado ou eliminado, salvo obrigações legais ou fiscais de conservação.</li>
            <li>Os dados necessários para cumprimento de obrigações fiscais (ex.: faturas) poderão ser conservados pelo período legalmente exigido.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Prazo de resposta
          </h2>
          <p>
            A SAM compromete-se a responder ao seu pedido e a confirmar a eliminação no prazo máximo de
            <strong> 30 dias</strong>, salvo se o pedido envolver dados sujeitos a obrigações legais de conservação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" />
            Como pedir a eliminação
          </h2>
          <p>
            Envie-nos um pedido por email para
            <a href="mailto:geral@sam.co.mz" className="text-accent hover:underline mx-1">geral@sam.co.mz</a>
            ou contacte-nos por telefone. O botão abaixo abre o seu cliente de email com um modelo de pedido pré-preenchido.
          </p>
          <a href={mailtoHref} className="block">
            <Button className="w-full sm:w-auto gap-2">
              <Trash2 className="w-4 h-4" />
              Pedir eliminação por email
            </Button>
          </a>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5 text-accent" />
            Contacto
          </h2>
          <p>
            Email:
            <a href="mailto:geral@sam.co.mz" className="text-accent hover:underline ml-1">geral@sam.co.mz</a>
          </p>
          <p>Tel: (+258) 84 32 53 910</p>
          <p>Horário: Seg. a Sex. 8h às 18h · Sáb. 8h às 13h</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
