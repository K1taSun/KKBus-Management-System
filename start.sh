#!/bin/bash

# ==============================================================================
# KKBus - Skrypt Automatyzacji Uruchomienia Projektu
# ==============================================================================

# Kolory dla konsoli
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "======================================================================"
echo "    🚌 KKBus Management System - Kreator Uruchomienia Projektu 🚌"
echo "======================================================================"
echo -e "${NC}"

# Sprawdzenie czy Docker jest uruchomiony
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}BŁĄD: Docker nie jest uruchomiony. Uruchom aplikację Docker i spróbuj ponownie.${NC}"
    exit 1
fi

echo -e "Wybierz tryb uruchomienia projektu:"
echo -e "  [1] ${GREEN}Tryb Docker-Only${NC} (Wszystko w kontenerach: baza, backend, frontend)"
echo -e "  [2] ${YELLOW}Tryb Hybrydowy (Zalecany do developmentu)${NC} (Baza w Dockerze, backend i frontend lokalnie)"
echo

read -p "Wprowadź numer wyboru [1-2]: " choice

if [ "$choice" == "1" ]; then
    echo -e "\n${BLUE}Uruchamianie projektu w trybie Docker-Only...${NC}"
    echo -e "${CYAN}Budowanie obrazów i uruchamianie kontenerów za pomocą docker-compose...${NC}"
    
    docker-compose -f infra/docker-compose.yml up --build

elif [ "$choice" == "2" ]; then
    echo -e "\n${BLUE}Uruchamianie projektu w trybie Hybrydowym...${NC}"
    
    # 1. Uruchomienie bazy danych w Dockerze
    echo -e "${CYAN}1. Uruchamianie bazy danych PostgreSQL w kontenerze...${NC}"
    docker-compose -f infra/docker-compose.yml up -d db
    
    # Odczekanie na gotowość bazy
    echo -e "${YELLOW}Czekanie na zainicjalizowanie bazy danych...${NC}"
    sleep 3
    
    # 2. Uruchomienie backendu i frontendu w nowych oknach Terminala macOS
    echo -e "${CYAN}2. Uruchamianie Backend API w nowym oknie Terminala...${NC}"
    osascript -e "tell app \"Terminal\" to do script \"cd '$PWD/backend' && npm install && npm run start:dev\""
    
    echo -e "${CYAN}3. Uruchamianie Frontend Web w nowym oknie Terminala...${NC}"
    osascript -e "tell app \"Terminal\" to do script \"cd '$PWD/frontend-next' && npm install && npm run dev -- -p 3001\""
    
    echo -e "\n${GREEN}Sukces! Baza danych działa w tle. Backend i frontend zostały uruchomione w osobnych oknach Terminala.${NC}"
    echo -e "Linki do serwisów:"
    echo -e "  - Frontend:   ${CYAN}http://localhost:3001${NC}"
    echo -e "  - Backend:    ${CYAN}http://localhost:3000/api${NC}"
    echo -e "  - pgAdmin:    ${CYAN}http://localhost:5050${NC}"
    echo
else
    echo -e "${RED}Nieprawidłowy wybór.${NC}"
    exit 1
fi
