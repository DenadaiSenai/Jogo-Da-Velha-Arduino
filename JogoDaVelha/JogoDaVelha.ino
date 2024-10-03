// Declaração de variáveis
int velha;
int linha;
int coluna;
bool HaVencedor = false;
int tabuleiro[9];
String jogada;

// Função para zerar tabuleiro
void zerarTabuleiro() {
  // Instrução for faz N repetições
  for (int index = 0; index < 9; index++) {
    tabuleiro[index] = 0;
  }
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

void imprimeTabuleiro() {
  Serial.println("-----");

  for (char l = 0; l < 3; l++) {
    //for (char c = 0; c < 3; c++) {
    // Imprime tabuleiro segunda linha
    Serial.print(tabuleiro[l * 3 + 0]);
    Serial.print("|");
    Serial.print(tabuleiro[l * 3 + 1]);
    Serial.print("|");
    Serial.println(tabuleiro[l * 3 + 2]);
    Serial.println("-----");
    //}
  }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
}

void loop() {
  // put your main code here, to run repeatedly:
  // Zera Tabuleiro
  int jogadorDaVez = 1;
  zerarTabuleiro();
  // Inicia variáveis do jogo
  bool HaVencedor = false;
  velha = 0;

  do {
    // Imprime o tabuleiro
    imprimeTabuleiro();

    // Limpa a variável que armazena a jogada
    jogada = "";
    // Digitar a jogada
    Serial.print("Digite sua jogada jogador ");
    Serial.println(jogadorDaVez);

    // Espera o comando da serial
    while (!Serial.available());
    // Recebe a jogada pela serial
    jogada = Serial.readStringUntil('\n');
    //jogada = Serial.readString();
    //Serial.println(jogada.length());
    if (validaJogada(jogada)) {
      // Se jogada válida continue .....
      // Serial.println("Se jogada válida continue .....");
      linha = int(jogada[0] - '0');
      coluna = int(jogada[2] - '0');
      Serial.print("Linha:");
      Serial.print(linha);
      Serial.print(", Coluna:");
      Serial.println(coluna);
      if (tabuleiro[3 * linha + coluna] == 0) {
        // Se for verdade ..
        // Serial.println("Jogadar inserido ..");
        tabuleiro[3 * linha + coluna] = jogadorDaVez;
        if ((tabuleiro[0] == jogadorDaVez && tabuleiro[3] == jogadorDaVez && tabuleiro[6] == jogadorDaVez) ||
            (tabuleiro[1] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[7] == jogadorDaVez) ||
            (tabuleiro[2] == jogadorDaVez && tabuleiro[5] == jogadorDaVez && tabuleiro[8] == jogadorDaVez)) {
          // Se a linha tem vencedor executa
          HaVencedor = true;
        } else if ((tabuleiro[0] == jogadorDaVez && tabuleiro[1] == jogadorDaVez && tabuleiro[2] == jogadorDaVez) ||
                   (tabuleiro[3] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[5] == jogadorDaVez) ||
                   (tabuleiro[6] == jogadorDaVez && tabuleiro[7] == jogadorDaVez && tabuleiro[8] == jogadorDaVez)) {
          // Se a coluna tem vencedor executa
          HaVencedor = true;

        } else if ((tabuleiro[0] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[8] == jogadorDaVez) ||
                   (tabuleiro[2] == jogadorDaVez && tabuleiro[4] == jogadorDaVez && tabuleiro[6] == jogadorDaVez)) {
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
          Serial.print("Peças jogadas: "); // Imprime a qtde de jogadas
          Serial.println(velha);
        }
      } else {
        // se for falso ...
        Serial.println("Casa ocupada ..");
      }
    } else {
      Serial.println("Jogada inválida!!!");
    }
    // delay(1000000);
  } while (!HaVencedor && velha < 9);

  if (HaVencedor) {
    // Escreve Há vencedor
    Serial.print("Jogador ");
    Serial.print(jogadorDaVez);
    Serial.println(" venceu!!!");
  } else {
    // Escreve VELHA!!!
    Serial.println("VELHA!!!");
  }
}
