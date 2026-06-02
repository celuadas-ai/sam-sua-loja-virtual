import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Termos e Condições" showBack />
      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto space-y-8 text-foreground text-sm leading-relaxed">
        <div>
          <h1 className="text-2xl font-bold">Termos e Condições de Uso</h1>
          <p className="text-muted-foreground mt-1">Última atualização: {new Date().toLocaleDateString('pt-MZ')}</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Identificação da Entidade</h2>
          <p>
            O website <strong>www.sam.co.mz</strong> pertence à Sociedade de Águas de Moçambique, Lda (SAM),
            matriculada a 08-06-2023 na Conservatória do Registo das Entidades Legais sob o{' '}
            <strong>NUEL 105 004 534</strong>, com sede em Av. 3 de Fevereiro, Parcela 5.611, Q.43, Bedene, Matola, Moçambique,
            que doravante será designada apenas SAM (Artigo 44 da Lei n.º 3/2017 de 9 de Janeiro das Transacções Electrónicas).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Âmbito do Website</h2>
          <p>
            O website <strong>www.sam.co.mz</strong> destina-se a todos os Utilizadores que desejam adquirir produtos e serviços SAM
            através de transacção lícita de natureza comercial com os métodos de pagamentos disponíveis anunciados.
          </p>
          <p>
            Para interagir com o website e efectuar transacções comerciais, o Utilizador deverá aceitar os Termos e Condições
            presentes neste documento, o qual se refere apenas e só às transacções comerciais efectuadas online na loja{' '}
            <strong>www.sam.co.mz/loja</strong>, não aplicável às restantes transacções comerciais sobre outras plataformas.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">3. Política de Envio e Entrega</h2>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">3.1 Filtragem</h3>
            <p>
              Todos os pedidos de encomenda serão filtrados numa primeira fase, especialmente aos novos Utilizadores,
              pois actualmente a SAM não tem capacidade de efectuar entregas nas regiões mais remotas do Grande Maputo,
              assim como a frota não tem capacidade de chegar a locais de difícil acesso (locais apenas de acesso a veículos de 4×4, por exemplo).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">3.2 Envio</h3>
            <p>
              Sendo que o serviço de entrega é gratuito para os Utilizadores, a SAM reserva-se ao direito de decidir sobre a entrega,
              justificando uma margem mínima na relação do valor pedido-entrega para que esta seja economicamente viável e sustentável.
            </p>
            <p>
              Se a entrega não for possível, o Utilizador será contactado e informado no prazo de <strong>24h</strong>.
            </p>
            <p>
              Depois da filtragem, os pedidos serão processados, enviados e entregues num prazo máximo de{' '}
              <strong>48 horas</strong> nos dias úteis. Não são efectuadas entregas aos fins-de-semana e feriados.
            </p>
            <p>
              Caso a entrega não seja possível dentro do prazo expectável das 48h, possivelmente por razões alheias ao nosso serviço
              (tráfego, chuvas, tempestades, etc.), a SAM tentará entrar em contacto via e-mail ou telefone a fim de informar/agendar a entrega.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">3.3 Endereços</h3>
            <p>
              Cabe única e exclusivamente ao Utilizador a responsabilidade de informar correctamente a morada,
              dispondo no formulário de pedido o campo “Informação adicional” onde devem ser colocadas, por exemplo,
              coordenadas ou pontos de referência que ajudem a localizar o seu endereço. De igual forma, o Utilizador
              dispõe na área de Cliente, em Menu <strong>“Loja &gt; Conta”</strong> o seu perfil, onde podem ser adicionadas mais moradas.
            </p>
            <p>
              Os erros de introdução de dados como nomes, moradas, NUIT, ou qualquer um dos restantes campos,
              devem ser corrigidos num prazo de <strong>24h</strong> como previsto no Artigo 37 da Lei n.º 3/2017 de 9 de Janeiro das Transacções Electrónicas.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Confirmação e Acompanhamento de Pedidos de Encomenda</h2>
          <p>
            Aquando do pedido de encomenda o Utilizador recebe um e-mail de confirmação de que a sua encomenda está actualmente em processamento.
            Como anteriormente referido, esta poderá ser cancelada se não cumprir os nossos critérios de filtragem.
            Quando a encomenda for entregue, receberá igualmente um e-mail a informar.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">5. Política de Devolução, Troca ou Reembolso</h2>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">5.1 Danos</h3>
            <p>
              A SAM é responsável por todo e quaisquer produtos danificados ou perdidos durante o transporte pela sua frota
              até à morada disponibilizada pelo Utilizador. Caso o Utilizador tenha recebido um produto em mau estado ou danificado,
              deverá em primeiro lugar recolher todos os materiais de embalagem e/ou mercadorias e apresentar reclamação através dos nossos contactos.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">5.2 Prazos de Reclamação</h3>
            <p>
              O prazo de apresentar uma reclamação em qualquer um dos nossos produtos é de <strong>14 dias</strong>{' '}
              (Artigo 45 da Lei n.º 3/2017 de 9 de Janeiro das Transacções Electrónicas). Terminado esse prazo,
              no caso dos equipamentos (Máquinas Dispensadoras), tem direito a uma garantia de <strong>6 (seis) meses</strong>{' '}
              contra defeitos de fabrico.
            </p>
            <p>
              Os equipamentos para serem elegíveis para devolução deverão estar nas mesmas condições em que foram recebidos,
              ainda com a embalagem original e junto com o respectivo recibo ou comprovativo de compra.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base">5.3 Reembolso</h3>
            <p>
              Uma vez recepcionado o produto este será analisado pelo nosso departamento de apoio ao cliente.
              Depois da análise, o Utilizador será informado do estado do reembolso e respectiva forma de reembolso
              (crédito em loja, substituição, ou transferência). No caso de água, o produto será imediatamente trocado,
              mas o recolhido na morada será reencaminhado para o departamento de qualidade para posterior análise.
              O prazo de reembolso é de <strong>30 dias</strong> como previsto no Artigo 46 da Lei n.º 3/2017 de 9 de Janeiro das Transacções Electrónicas.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">6. Direitos e Deveres dos Utilizadores</h2>
          <p>
            O Utilizador aceita não utilizar o website para fins distintos aos que se destinam, nomeadamente fins ilícitos.
          </p>
          <p>
            O Utilizador obriga-se a não criar, copiar, reproduzir, modificar ou utilizar por qualquer forma qualquer conteúdo do website.
          </p>
          <p>
            O Utilizador obriga-se, ainda, a não enviar a terceiros ou por outra forma divulgar, distribuir ou exibir publicamente
            qualquer conteúdo do website, sem prévia e expressa autorização da SAM.
          </p>
          <p>O Utilizador obriga-se ainda a não:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Restringir ou impedir qualquer outro Utilizador de utilizar o website;</li>
            <li>Fazer-se representar como sendo outra pessoa;</li>
            <li>Interromper ou interferir com o website e qualquer conteúdo deste ou com a sua operação e disponibilidade (por exemplo, publicando ou transmitindo qualquer informação ou software que contenha vírus, malware ou qualquer outro dispositivo incapacitante ou componente nocivo, bem como participando num ataque de negação de serviço);</li>
            <li>Publicar ou transmitir qualquer conteúdo ilegal, fraudulento, calunioso, difamatório, obsceno, pornográfico, sexualmente explícito, profano, ameaçador, insultuoso, violento, discriminatório, odioso, ofensivo, persecutório ou de qualquer outra natureza objectável, incluindo, entre outros, quaisquer transmissões que constituam ou incentivem condutas que possam personificar uma ofensa criminal, dar origem a responsabilidade civil ou que violem qualquer legislação relevante;</li>
            <li>Publicar ou transmitir qualquer informação, incluindo imagens, que sejam invasivas de privacidade ou que violem ou infrinjam os direitos de outras pessoas (incluindo direitos de propriedade intelectual como direitos de autor);</li>
            <li>Publicar ou transmitir qualquer informação que se considere ser sensível, incluindo (entre outros) qualquer informação sobre o Utilizador ou outra pessoa relativamente a condições médicas ou de saúde, informação financeira (incluindo conta bancária ou números de cartão de crédito), orientação sexual, opiniões políticas, crenças religiosas ou quaisquer outras matérias sensíveis;</li>
            <li>Publicar ou transmitir quaisquer anúncios publicitários, solicitações comerciais, comunicações em cadeia, esquemas em pirâmide, oportunidades de investimento ou esquemas, bem como outras comunicações comerciais não solicitadas (incluindo a participação em operações de spam ou flooding);</li>
            <li>Publicar ou transmitir quaisquer dados ou software que não possam ser exportados sem a devida autorização prévia por escrito, incluindo, entre outros, software que tenha capacidade de encriptação.</li>
          </ul>
          <p>
            O Utilizador garante ainda a veracidade, completude e actualidade das informações que submete.
            Caso as informações submetidas se demonstrem falsas, incompletas ou desactualizadas, a SAM poderá impossibilitar o acesso
            do Utilizador ao website e/ou as funcionalidades concretas do website. A SAM reserva-se ainda no direito de, a qualquer momento,
            exigir aos Utilizadores a comprovação dos dados pessoais disponibilizados pelos mesmos.
          </p>
          <p>
            O Utilizador é responsável por obter o acesso necessário à rede de dados com vista à utilização do website.
            É possível que se apliquem as tarifas e taxas da rede de dados e mensagens do equipamento móvel do Utilizador,
            caso aceda ou utilize o website a partir de um dispositivo móvel, sendo que o Utilizador é responsável pelo pagamento de tais taxas e tarifas.
            O Utilizador é responsável pela aquisição e actualização do equipamento ou dos dispositivos necessários para aceder e utilizar o website
            e quaisquer actualizações ao mesmo. Os serviços poderão estar sujeitos a falhas e atrasos inerentes ao uso da internet e comunicações electrónicas.
            A SAM não pode garantir o funcionamento interrupto do website.
          </p>
          <p>
            O Utilizador é o único responsável por todas as operações realizadas por si no website.
          </p>
          <p>
            O Utilizador declara que irá notificar imediatamente a SAM caso tenha conhecimento de qualquer uso não autorizado ou qualquer violação de segurança.
          </p>
          <p>
            O Utilizador tem o direito de gestão, alteração ou eliminação dos seus dados, como previsto na Política de Privacidade e Cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">7. Responsabilidade e Limitação da SAM</h2>
          <p>
            A SAM garante que se enconca em posição legítima e legal de fornecer o website.
          </p>
          <p>
            Não há qualquer relação para além da comercial entre a SAM e o Utilizador para além da disponibilização do website,
            conforme previsto nos Termos e Condições aqui apresentados.
          </p>
          <p>A SAM não é responsável, sob qualquer forma, designadamente, mas sem limitar, por:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Quaisquer falhas ou interrupções no funcionamento do website e a incapacidade de acesso;</li>
            <li>Qualquer dano que possa advir de um incorrecto funcionamento do website e a incapacidade de acesso, seja por falha informática, vírus, cavalos de troia, worms, logic bombs ou algo que cause interferência na plataforma ou na comunicação.</li>
          </ul>
          <p>
            A SAM não se responsabiliza ainda por quaisquer falhas, defeitos ou atrasos verificados no envio e recepção de comunicação do website
            decorrentes de qualquer uma das seguintes situações:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>O equipamento do Utilizador encontrar-se desligado, sem rede ou, por qualquer outra razão, não se encontrar disponível;</li>
            <li>A ligação do Utilizador à internet não possuir velocidade suficiente e adequada para a correcta visualização dos conteúdos;</li>
            <li>Qualquer outra razão fora do controlo do website da SAM.</li>
          </ul>
          <p>
            O website permite o acesso a serviços e conteúdos de terceiros fora do controlo da SAM, com a plataforma Google Maps.
            O Utilizador reconhece que a utilização de serviços e conteúdos de terceiros poderá estar sujeita aos respectivos termos de utilização
            e políticas de privacidade. A SAM não oferece qualquer garantia e não é responsável por tais serviços e conteúdos de terceiros.
            O acesso aos serviços, pelo Utilizador, está sujeito às condições estipuladas nos termos e condições aplicáveis aos serviços e conteúdos de terceiros.
          </p>
          <p>
            A SAM e os seus responsáveis não poderão ser responsabilizados, em quaisquer circunstâncias, por qualquer acto, vicissitude ou dano relacionado com o website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">8. Como Contactar</h2>
          <p>
            O exercício dos seus direitos pode ser realizado junto da sede da SAM, Lda, sita em Bedene, Matola, Machava, Moçambique,
            ou através do endereço de e-mail <strong>geral@sam.co.mz</strong>.
          </p>
          <p>
            A SAM garante que a resposta aos seus pedidos deverá ser prestada no prazo máximo de <strong>30 dias</strong>,
            salvo se for um pedido especialmente complexo.
          </p>
          <p>
            Sempre que se justificar poderá ainda apresentar reclamações junto da SAM, utilizando o mesmo endereço electrónico.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
