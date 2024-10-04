#include <ArduinoJson.h>

// Macro para calcular a qtde de elementos de uma matriz
#define ARRAY_SIZE(array) ((sizeof(array)) / (sizeof(array[0])))

// Declaração de variáveis globais
bool HaVencedor = false;  // Variável de controle indica se houve vencedor
int velha;                // Faz a contagem de jogadas e se passar de 9 é declardado empate (VELHA)
int linha;                // Armazena a linha da posição do lance do jogador
int coluna;               // Armazena a coluna da posição do lance do jogador
int tabuleiro[9];         // Variável do tabuleiro com 9 posições (3x3)
int jogadorDaVez = 1;     // Aramazena o jogador da vez
String erro = "";         // Variável para armazenar a mensagem de erro (JSON)

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
  Serial.begin(115200);
}

void loop() {
  // Zera Tabuleiro e inica a variáveis globais do jogo
  zerarTabuleiro();

  PartidaJSON(F("Partida Iniciada"));  // Envia o JSON do estado da partida (Início)
  do {
    // Atualiza as informações do JSON e envia pela serial
    PartidaJSON("Digite sua jogada jogador " + String(jogadorDaVez), erro);

    // Limpa a variável que armazena a jogada
    jogada = "";

    // Espera o comando da serial
    while (!Serial.available())
      ;
    // Recebe a jogada pela serial
    // a jogada é uma string que indica a linha e a coluna no tabuleiro
    jogada = Serial.readStringUntil('\n');

    erro = "";  // Atualiza a variável da msg de erro
    if (validaJogada(jogada)) {
      // Se jogada válida continue .....
      // Serial.println("Se jogada válida continue .....");
      linha = int(jogada[0] - '0');
      coluna = int(jogada[2] - '0');

      if (tabuleiro[3 * linha + coluna] == 0) {
        // Se for verdade ..
        // Serial.println("Jogadar inserido ..");
        tabuleiro[3 * linha + coluna] = jogadorDaVez;
        if ((tabuleiro[0] == jogadorDaVez && tabuleiro[3] == jogadorDaVez && tabuleiro[6] == jogadorDaVez) || (tabuleiro[1] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[7] == jogadorDaVez) || (tabuleiro[2] == jogadorDaVez && tabuleiro[5] == jogadorDaVez && tabuleiro[8] == jogadorDaVez)) {
          // Se a linha tem vencedor executa
          HaVencedor = true;
        } else if ((tabuleiro[0] == jogadorDaVez && tabuleiro[1] == jogadorDaVez && tabuleiro[2] == jogadorDaVez) || (tabuleiro[3] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[5] == jogadorDaVez) || (tabuleiro[6] == jogadorDaVez && tabuleiro[7] == jogadorDaVez && tabuleiro[8] == jogadorDaVez)) {
          // Se a coluna tem vencedor executa
          HaVencedor = true;

        } else if ((tabuleiro[0] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[8] == jogadorDaVez) || (tabuleiro[2] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[6] == jogadorDaVez)) {
          // Se a diagonal tem vencedor executa
          HaVencedor = true;

        } else {
          // Trocar jogador
          if (jogadorDaVez == 1) {
            jogadorDaVez = 2;
          } else {
            jogadorDaVez = 1;
          }
          velha = velha + 1;
          // Serial.print("Peças jogadas: ");  // Imprime a qtde de jogadas
          // Serial.println(velha);
        }
      } else {
        // se for falso ...
        // Serial.println("Casa ocupada ...");
        erro = F("Casa ocupada ...");
      }
    } else {
      // Serial.println("Jogada inválida!!!");
      erro = F("Jogada inválida");
    }
    // delay(1000000);
  } while (!HaVencedor && velha < 9);  // Finaliza o jogo caso tenha vencedor ou empate

  if (HaVencedor) {  // Mensagem sobre o vencedor
    // Escreve Há vencedor
    // Serial.print("Jogador ");
    // Serial.print(jogadorDaVez);
    // Serial.println(" venceu!!!");
    PartidaJSON("Jogador " + String(jogadorDaVez) + " venceu!!! Reiniciar !!!");
  } else {  // Mensagem do empate (VELHA)
    // Escreve VELHA!!!
    // Serial.println("VELHA!!!");
    PartidaJSON(F("VELHA!!! Reiniciar !!!"));
  }

  // Espera um dado na serial para reiniciar
  while (!Serial.available());
  Serial.readStringUntil('\n');
}