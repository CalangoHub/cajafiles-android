#!/usr/bin/env bash
# Script para iniciar o servidor de testes do Caja Mobile

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=========================================================="
echo "  Iniciando Caja Mobile - Gerenciador de Arquivos Android"
echo "  Tema: Azul Clarinho Nostálgico"
echo "=========================================================="
echo ""
echo "Acesse no navegador ou no celular (pelo IP local na mesma rede):"
echo "-> http://localhost:3000"
echo ""

npx serve www -l 3000
