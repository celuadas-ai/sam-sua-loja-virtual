import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border px-4 py-6 text-center text-xs text-muted-foreground space-y-2">
      <p className="font-semibold text-foreground text-sm">SAM - Sua Loja Virtual</p>
      <p>Sociedade de Águas de Moçambique, Lda. · NUIT: 400115041</p>
      <p>Av. 3 de Fevereiro, Parcela 5.611, Q.43, Bedene, Matola, Moçambique</p>
      <p>Tel: +258 84 325 3910 / +258 82 325 3910 · geral@sam.co.mz</p>
      <p>sam.co.mz · aguadanamaacha.co.mz</p>
      <div className="flex justify-center gap-4 pt-2">
        <Link to="/termos-e-condicoes" className="text-accent hover:underline">
          Termos e Condições
        </Link>
        <Link to="/privacidade" className="text-accent hover:underline">
          Política de Privacidade
        </Link>
      </div>
      <p className="pt-2">© {new Date().getFullYear()} SAM. Todos os direitos reservados.</p>
    </footer>
  );
}
