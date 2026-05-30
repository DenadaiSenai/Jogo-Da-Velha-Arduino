export const ARDUINO_INO_CODE = `#include <ArduinoJson.h>

// Velocidade da serial BITS POR SEGUNDO
#define BAUDRATE 115200

// Macro para calcular a qtde de elementos de uma matriz
#define ARRAY_SIZE(array) ((sizeof(array)) / (sizeof(array[0])))

// Declaração de variáveis
int velha;
int linha;
int coluna;
bool HaVencedor = false;
int tabuleiro[9];
int jogadorDaVez = 1;
String erro = "";

// Jogo - JSON para envio ao Node-red pela serial
JsonDocument Jogo;

// Armazena a jogada que é recebida pela Serial
String jogada;

// Função para zerar tabuleiro
void zerarTabuleiro() {
  // Zera o tabuleiro
  for (int index = 0; index < 9; index++) {
    tabuleiro[index] = 0;
  }

  // Inicia as Variáveis globais
  velha = 0;
  linha = 0;
  coluna = 0;
  HaVencedor = false;
  jogadorDaVez = 1;
  erro = "";
  jogada = "";
}

// Função de validação da jogada
// Retorna true se a entrada tiver tamanho de 3 caracteres
// Retorna false se alguma condição não for satisfeita
bool validaJogada(String entrada) {
  bool entradaValida = false;
  // Testa o tamanho da jogada (entrada)
  if (entrada.length() == 3) {
    // Verifica a primeira posição
    if (entrada[0] == '0' || entrada[0] == '1' || entrada[0] == '2') {
      // Verifica a terceira posição da entrada/jogada
      if (entrada[2] == '0' || entrada[2] == '1' || entrada[2] == '2') {
        // Retorna verdadeiro se todas as condições são válidas
        entradaValida = true;
      }
    }
  }
  return entradaValida;
}

// Função para serializar uma matriz de inteiros em string
// int matriz -> matriz a ser serializada
// int size -> tamanho da matriz, utilizada no FOR
String IntArrayToString(int matriz[], int size) {
  String result = "";
  for (int i = 0; i < size; i++) {
    result += String(matriz[i]);
  }
  return result;
}

// Função que atualiza o JSON e envia pela serial
// String msg -> Mensagem sobre o jogo
// String erro -> Mensagem de erros de lances de jogadas
void PartidaJSON(String msg = "", String erro = "") {
  // Constrói o JSON
  Jogo["velha"] = velha;
  Jogo["linha"] = linha;
  Jogo["coluna"] = coluna;
  Jogo["HaVencedor"] = HaVencedor;
  Jogo["tabuleiro"] = IntArrayToString(tabuleiro, ARRAY_SIZE(tabuleiro));
  Jogo["msg"] = msg;
  Jogo["erro"] = erro;
  Jogo["jogadorDaVez"] = jogadorDaVez;
  // Envia o JSON pela serial
  serializeJson(Jogo, Serial);
  Serial.println();
}

void setup() {
  // Habilita a serial em configura com a velocidade de 115200
  Serial.begin(BAUDRATE);
}

void loop() {
  // Zera Tabuleiro e inica a variáveis globais do jogo
  zerarTabuleiro();

  PartidaJSON(F("Partida Iniciada"));  // Envia o JSON do estado da partida (Início)
  do {
    // Para atualizar as informações do JSON e enviar pela serial
    PartidaJSON("Digite sua jogada jogador " + String(jogadorDaVez), erro);

    // Limpa a variável que armazena a jogada
    jogada = "";

    // Espera o comando da serial
    while (!Serial.available())
      ;
    // Recebe a jogada pela serial
    // a jogada é uma string que indica a linha e a coluna no tabuleiro
    jogada = Serial.readStringUntil('\\n');
    erro = "";  // Limpa a variável da msg de erro
    if (validaJogada(jogada)) {
      linha = int(jogada[0] - '0');
      coluna = int(jogada[2] - '0');

      if (tabuleiro[3 * linha + coluna] == 0) {
        tabuleiro[3 * linha + coluna] = jogadorDaVez;
        if ((tabuleiro[0] == jogadorDaVez && tabuleiro[3] == jogadorDaVez && tabuleiro[6] == jogadorDaVez) || (tabuleiro[1] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[7] == jogadorDaVez) || (tabuleiro[2] == jogadorDaVez && tabuleiro[5] == jogadorDaVez && tabuleiro[8] == jogadorDaVez)) {
          HaVencedor = true;
        } else if ((tabuleiro[0] == jogadorDaVez && tabuleiro[1] == jogadorDaVez && tabuleiro[2] == jogadorDaVez) || (tabuleiro[3] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[5] == jogadorDaVez) || (tabuleiro[6] == jogadorDaVez && tabuleiro[7] == jogadorDaVez && tabuleiro[8] == jogadorDaVez)) {
          HaVencedor = true;
        } else if ((tabuleiro[0] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[8] == jogadorDaVez) || (tabuleiro[2] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[6] == jogadorDaVez)) {
          HaVencedor = true;
        } else {
          // Trocar jogador
          if (jogadorDaVez == 1) {
            jogadorDaVez = 2;
          } else {
            jogadorDaVez = 1;
          }
          velha = velha + 1;
        }
      } else {
        erro = F("Casa ocupada ...");
      }
    } else {
      erro = F("Jogada inválida");
    }
  } while (!HaVencedor && velha < 9);  // Finaliza o jogo caso tenha vencedor ou empate

  if (HaVencedor) {  // Mensagem sobre o vencedor
    PartidaJSON("Jogador " + String(jogadorDaVez) + " venceu!!! Reiniciar !!!");
  } else {  // Mensagem do empate (VELHA)
    PartidaJSON(F("VELHA!!! Reiniciar !!!"));
  }
  // Ao terminar o jogo, aguarda um sinal pela serial para iniciar uma nova partida
  while (!Serial.available());
  Serial.readStringUntil('\\n');
}
`;
