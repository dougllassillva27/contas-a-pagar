<?php
// api/relatorios/imprimir_cartao.php

require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/conexao.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/proteger_pagina.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/contas/inc/fpdf/fpdf.php';

$mes_ano = $_GET['mes'] ?? date('Y-m');
$usuario_id = $_SESSION['usuario_id'];

setlocale(LC_TIME, 'pt_BR.utf-8', 'pt_BR', 'portuguese');
$data_titulo = new DateTime($mes_ano . '-01');
$nome_mes_ano = ucfirst(strftime('%B de %Y', $data_titulo->getTimestamp()));

// Lógica de busca de dados (permanece a mesma)
try {
    $stmt = $pdo->prepare(
        "SELECT nome_terceiro, descricao, valor, parcela_info
         FROM contas
         WHERE 
            usuario_id = ? AND 
            mes_ano_referencia = ? AND
            (
                nome_terceiro IS NOT NULL OR
                (nome_terceiro IS NULL AND tipo IN ('UNICA', 'PARCELADA'))
            )
         ORDER BY ISNULL(nome_terceiro), nome_terceiro, ordem ASC"
    );
    $stmt->execute([$usuario_id, $mes_ano]);
    $lancamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro ao buscar dados: " . $e->getMessage());
}

$dados_agrupados = [];
foreach ($lancamentos as $lancamento) {
    $terceiro = $lancamento['nome_terceiro'] ?: 'Dodo';
    $dados_agrupados[$terceiro][] = $lancamento;
}


// CLASSE PDF TOTALMENTE REFEITA PARA UM DESIGN PROFISSIONAL
class PDF extends FPDF
{
    private $titulo_relatorio;

    function setTitulo($titulo) {
        $this->titulo_relatorio = $titulo;
    }

    function Header() {
        $this->SetFont('Arial', 'B', 18);
        $this->SetTextColor(50, 50, 50);
        $this->Cell(0, 10, utf8_decode('Relatório de Despesas do Cartão de Crédito'), 0, 1, 'C');
        $this->SetFont('Arial', '', 12);
        $this->SetTextColor(100, 100, 100);
        $this->Cell(0, 8, utf8_decode($this->titulo_relatorio), 0, 1, 'C');
        $this->Ln(8);
    }

    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(150, 150, 150);
        $this->Cell(0, 10, utf8_decode('Página ') . $this->PageNo() . '/{nb}', 0, 0, 'C');
    }

    function TabelaGrupo($nome_grupo, $header_colunas, $data) {
        $w = array(145, 45); // Larguras das colunas para ocupar a página A4 (190mm de área útil)

        // Cabeçalho do Grupo
        $this->SetFont('Arial', 'B', 12);
        $this->SetFillColor(70, 130, 180); // Azul Aço
        $this->SetTextColor(255, 255, 255);
        $this->Cell(array_sum($w), 10, utf8_decode('Despesas de: ' . $nome_grupo), 1, 1, 'C', true);

        // Cabeçalho das Colunas
        $this->SetFont('Arial', 'B', 10);
        $this->SetFillColor(220, 220, 220);
        $this->SetTextColor(0, 0, 0);
        $this->Cell($w[0], 7, utf8_decode($header_colunas[0]), 1, 0, 'C', true);
        $this->Cell($w[1], 7, utf8_decode($header_colunas[1]), 1, 1, 'C', true);

        // Linhas de Dados
        $this->SetFont('Arial', '', 10);
        $this->SetFillColor(245, 245, 245);
        $fill = false;
        $total_grupo = 0;
        foreach ($data as $row) {
            $descricao = $row['descricao'];
            if ($row['parcela_info']) {
                $descricao .= ' (' . $row['parcela_info'] . ')';
            }
            $this->Cell($w[0], 7, utf8_decode($descricao), 'LR', 0, 'L', $fill);
            $this->Cell($w[1], 7, 'R$ ' . number_format($row['valor'], 2, ',', '.'), 'LR', 1, 'R', $fill);
            $total_grupo += $row['valor'];
            $fill = !$fill;
        }
        $this->Cell(array_sum($w), 0, '', 'T'); // Linha final da tabela
        $this->Ln();

        // Total do Grupo
        $this->SetFont('Arial', 'B', 10);
        $this->Cell($w[0], 8, 'Total do Grupo', 'T', 0, 'R');
        $this->Cell($w[1], 8, 'R$ ' . number_format($total_grupo, 2, ',', '.'), 'T', 1, 'R');

        return $total_grupo;
    }
}

// --- GERAÇÃO DO PDF ---

$pdf = new PDF('P', 'mm', 'A4');
$pdf->SetMargins(10, 10, 10); // Define as margens da página
$pdf->setTitulo($nome_mes_ano);
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetTitle(utf8_decode("Relatorio - " . $nome_mes_ano));


$total_geral = 0;
// Lógica de ordenação dos grupos
$ordem_grupos = [];
if(isset($dados_agrupados['Dodo'])) {
    $ordem_grupos[] = 'Dodo';
}
$outros_grupos = array_keys($dados_agrupados);
sort($outros_grupos);
foreach($outros_grupos as $terceiro) {
    if ($terceiro != 'Dodo') {
        $ordem_grupos[] = $terceiro;
    }
}

// Itera e cria uma tabela para cada grupo
foreach ($ordem_grupos as $terceiro) {
    if (!isset($dados_agrupados[$terceiro])) continue;
    
    $header_colunas = ['Descrição', 'Valor (R$)'];
    $total_grupo = $pdf->TabelaGrupo($terceiro, $header_colunas, $dados_agrupados[$terceiro]);
    $total_geral += $total_grupo;
    $pdf->Ln(10); // Espaçamento entre as tabelas dos grupos
}

// Linha do Total Geral Final
if (count($dados_agrupados) > 0) {
    $pdf->Ln(5);
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetFillColor(50, 50, 50);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->Cell(145, 12, 'TOTAL GERAL CONSOLIDADO', 0, 0, 'R', true);
    $pdf->Cell(45, 12, 'R$ ' . number_format($total_geral, 2, ',', '.'), 0, 1, 'R', true);
}

$nome_arquivo_amigavel = 'Relatorio_Cartao_' . str_replace(' de ', '_', $nome_mes_ano) . '.pdf';
$pdf->Output('I', $nome_arquivo_amigavel);
?>