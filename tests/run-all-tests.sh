#!/bin/bash

# Ustawienie kolorów dla czytelności konsoli
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Przejście do katalogu tests
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

REPORT_FILE="test-report.txt"
echo "==========================================================" > "$REPORT_FILE"
echo "          RAPORT Z URUCHOMIENIA TESTÓW KKBUS              " >> "$REPORT_FILE"
echo "          Data: $(date)" >> "$REPORT_FILE"
echo "==========================================================" >> "$REPORT_FILE"

echo -e "${CYAN}Instalacja zależności testowych w katalogu tests/...${NC}"
npm install | tee -a "$REPORT_FILE"

echo -e "\n${BLUE}1. URUCHAMIANIE TESTÓW JEDNOSTKOWYCH (Unit Tests)...${NC}" | tee -a "$REPORT_FILE"
npm run test:unit 2>&1 | tee -a "$REPORT_FILE"
UNIT_STATUS=${PIPESTATUS[0]}

echo -e "\n${BLUE}2. URUCHAMIANIE TESTÓW INTEGRACYJNYCH (Integration Tests)...${NC}" | tee -a "$REPORT_FILE"
npm run test:integration 2>&1 | tee -a "$REPORT_FILE"
INT_STATUS=${PIPESTATUS[0]}

echo -e "\n${BLUE}3. URUCHAMIANIE SCENARIUSZY E2E (End-to-End)...${NC}" | tee -a "$REPORT_FILE"
npm run test:e2e 2>&1 | tee -a "$REPORT_FILE"
E2E_STATUS=${PIPESTATUS[0]}

echo -e "\n${BLUE}4. URUCHAMIANIE TESTÓW WYDAJNOŚCIOWYCH (Performance)...${NC}" | tee -a "$REPORT_FILE"
npm run test:perf 2>&1 | tee -a "$REPORT_FILE"
PERF_STATUS=${PIPESTATUS[0]}

# 5. CZYSZCZENIE DANYCH TESTOWYCH Z BAZY DANYCH
if docker ps | grep -q "kkbus_db"; then
  echo -e "\n${CYAN}5. CZYSZCZENIE DANYCH TESTOWYCH (Database Cleanup)...${NC}" | tee -a "$REPORT_FILE"
  docker exec -i kkbus_db psql -U kkbus_user -d kkbus_db -c "
    DELETE FROM failed_logins WHERE email LIKE 'e2e.%';
    DELETE FROM system_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'e2e.%');
    DELETE FROM users WHERE email LIKE 'e2e.%';
  " 2>&1 | tee -a "$REPORT_FILE"
fi

echo -e "\n==========================================================" | tee -a "$REPORT_FILE"
echo "                      PODSUMOWANIE                        " | tee -a "$REPORT_FILE"
echo "==========================================================" | tee -a "$REPORT_FILE"

if [ $UNIT_STATUS -eq 0 ]; then
  echo -e "Testy jednostkowe:     ${GREEN}ZDANE${NC}" | tee -a "$REPORT_FILE"
else
  echo -e "Testy jednostkowe:     ${RED}BŁĄD (status: $UNIT_STATUS)${NC}" | tee -a "$REPORT_FILE"
fi

if [ $INT_STATUS -eq 0 ]; then
  echo -e "Testy integracyjne:    ${GREEN}ZDANE${NC}" | tee -a "$REPORT_FILE"
else
  echo -e "Testy integracyjne:    ${RED}BŁĄD (status: $INT_STATUS)${NC}" | tee -a "$REPORT_FILE"
fi

if [ $E2E_STATUS -eq 0 ]; then
  echo -e "Testy E2E:             ${GREEN}ZDANE${NC}" | tee -a "$REPORT_FILE"
elif [ $E2E_STATUS -eq 2 ]; then
  echo -e "Testy E2E:             ${YELLOW}POMINIĘTE${NC}" | tee -a "$REPORT_FILE"
else
  echo -e "Testy E2E:             ${RED}BŁĄD (status: $E2E_STATUS)${NC}" | tee -a "$REPORT_FILE"
fi

if [ $PERF_STATUS -eq 0 ]; then
  echo -e "Testy wydajnościowe:   ${GREEN}ZDANE${NC}" | tee -a "$REPORT_FILE"
elif [ $PERF_STATUS -eq 2 ]; then
  echo -e "Testy wydajnościowe:   ${YELLOW}POMINIĘTE${NC}" | tee -a "$REPORT_FILE"
else
  echo -e "Testy wydajnościowe:   ${RED}BŁĄD (status: $PERF_STATUS)${NC}" | tee -a "$REPORT_FILE"
fi

echo -e "\nPełny log testów został zapisany w: ${YELLOW}tests/$REPORT_FILE${NC}"
