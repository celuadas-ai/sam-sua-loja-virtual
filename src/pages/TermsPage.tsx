import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Termos e Condições" showBack />
      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto space-y-6 text-foreground text-sm leading-relaxed">
        <h1 className="text-2xl font-bold">Termos e Condições de Uso</h1>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-MZ')}</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Identificação da Entidade</h2>
          <p>
            A plataforma SAM - Sua Loja Virtual é operada pela Sociedade de Águas de Moçambique, Lda.,
            pessoa coletiva de direito moçambicano, com sede em Maputo, Moçambique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Enquadramento Legal</h2>
          <p>
            Os presentes termos são regulados pela legislação moçambicana, nomeadamente pela
            <strong> Lei n.º 3/2017 de 9 de Janeiro</strong> (Lei das Transações Eletrónicas de Moçambique),
            que estabelece o regime jurídico aplicável às transações eletrónicas, comércio eletrónico,
            assinaturas eletrónicas e serviços da sociedade da informação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Objeto</h2>
          <p>
            A plataforma SAM permite a comercialização e entrega de produtos ao domicílio na cidade de Maputo
            e arredores, nos termos previstos na legislação aplicável ao comércio eletrónico em Moçambique.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Registo e Identificação Fiscal</h2>
          <p>
            Para utilizar a plataforma, o utilizador deve fornecer os seus dados pessoais, incluindo o
            Número Único de Identificação Tributária (NUIT), conforme exigido pela legislação fiscal
            moçambicana para efeitos de faturação eletrónica.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Preços e Impostos</h2>
          <p>
            Todos os preços apresentados na plataforma incluem o Imposto sobre o Valor Acrescentado (IVA)
            à taxa legal em vigor de <strong>16%</strong>, nos termos do Código do IVA moçambicano.
            O valor do IVA é discriminado de forma clara no resumo da encomenda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Pagamentos</h2>
          <p>
            A plataforma aceita os seguintes métodos de pagamento: M-Pesa, e-Mola, POS (cartão na entrega)
            e numerário. Todos os pagamentos eletrónicos são processados em conformidade com a
            Lei das Transações Eletrónicas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">7. Direito de Resolução</h2>
          <p>
            O consumidor tem direito a desistir do contrato no prazo de 14 dias a contar da receção dos
            produtos, sem necessidade de indicar motivo, nos termos da Lei de Defesa do Consumidor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Resolução de Litígios</h2>
          <p>
            Para a resolução de quaisquer litígios emergentes dos presentes termos será competente o
            Tribunal Judicial da Cidade de Maputo, com aplicação da lei moçambicana.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
