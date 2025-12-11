document.addEventListener("DOMContentLoaded", () => {
    const abas = document.querySelectorAll(".abas_vendedor .aba");

    // Associa alvo → seção por classe
    const secoes = {
        produtos: document.querySelector(".aba_produto"),
        pedidos: document.querySelector(".aba_pedidos"),
        estatistica: document.querySelector(".aba_estatistica")
    };

    function ativarAba(chaveSecao, abaEl) {
        // ativa a aba
        abas.forEach(a => a.classList.toggle("ativa", a === abaEl));

        // ativa a seção 
        Object.entries(secoes).forEach(([chave, secao]) => {
            if (!secao) return;
            secao.classList.toggle("extra", chave === chaveSecao);
        });
    }

    // liga cliques
    abas.forEach(aba => {
        const target = aba.dataset.target 

        aba.addEventListener("click", e => {
            e.preventDefault();
            if (target) ativarAba(target, aba);
        });
    });

    // ativa a primeira ou a que já tem .ativa
    const inicial = document.querySelector(".aba.ativa") || abas[0];
    const targetInicial =
        inicial.dataset.target ||
        inicial.querySelector("[data-target]")?.dataset.target;

    ativarAba(targetInicial, inicial);
});