import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Política de Privacidade" showBack />
      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto space-y-6 text-foreground text-sm leading-relaxed">
        <h1 className="text-2xl font-bold">Política de Privacidade</h1>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-MZ')}</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Responsável pelo Tratamento</h2>
          <p>
            A Sociedade de Águas de Moçambique, Lda. é a entidade responsável pelo tratamento dos dados
            pessoais recolhidos através da plataforma SAM - Sua Loja Virtual.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Enquadramento Legal</h2>
          <p>
            O tratamento de dados pessoais é efetuado em conformidade com a
            <strong> Lei n.º 3/2017 de 9 de Janeiro</strong> (Lei das Transações Eletrónicas de Moçambique)
            e demais legislação aplicável à proteção de dados pessoais em Moçambique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Dados Recolhidos</h2>
          <p>Recolhemos os seguintes dados pessoais:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nome completo</li>
            <li>Endereço de email</li>
            <li>Número de telefone</li>
            <li>Número Único de Identificação Tributária (NUIT)</li>
            <li>Endereço de entrega e coordenadas de geolocalização</li>
            <li>Histórico de encomendas e transações</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Finalidades do Tratamento</h2>
          <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Processamento e entrega de encomendas</li>
            <li>Emissão de faturas eletrónicas conforme legislação fiscal</li>
            <li>Comunicação com o cliente sobre o estado das encomendas</li>
            <li>Cumprimento de obrigações legais e fiscais</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Partilha de Dados</h2>
          <p>
            Os dados podem ser partilhados com a Autoridade Tributária de Moçambique para cumprimento
            de obrigações fiscais, e com os operadores de entrega para fins de processamento de encomendas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Segurança dos Dados</h2>
          <p>
            Implementamos medidas técnicas e organizativas adequadas para proteger os dados pessoais
            contra acesso não autorizado, alteração, divulgação ou destruição, em conformidade com
            as melhores práticas e a legislação aplicável.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Direitos dos Titulares</h2>
          <p>
            Nos termos da legislação aplicável, o utilizador tem direito a aceder, retificar, apagar
            e limitar o tratamento dos seus dados pessoais. Para exercer estes direitos, contacte-nos
            através dos canais indicados na plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Contacto</h2>
          <p>
            Para questões relacionadas com a privacidade dos seus dados, contacte-nos através do
            email info@sam.co.mz ou pelo telefone +258 841234567.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
