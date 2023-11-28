#include <Arduino.h>
#include <HID-Project.h>
#include "EasyMFRC522.h"
#include "pitches.h"
#include <LiquidCrystal_I2C.h> // Library for LCD

#define MAX_STRING_SIZE 100 // size of the char array that will be written to the tag
#define BLOCK 1             // initial block, from where the data will be stored in the tag

EasyMFRC522 rfidReader(10, 9); // the Mifare sensor, with the SDA and RST pins given
                               // the default (factory) keys A and B are used (or used setKeys to change)
int result;
char stringBuffer[MAX_STRING_SIZE];

LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C address 0x27, 16 column and 2 rows

int melodyON[] = {
    NOTE_F5, NOTE_C5, NOTE_F6, NOTE_C6, 0, 0, NOTE_F7, NOTE_F7};

int noteDurationsON[] = {
    125, 125, 125, 125, 63, 63, 63, 63};

void buzzerON()
{
  // iterate over the notes of the melody:
  for (int thisNote = 0; thisNote < 8; thisNote++)
  {

    tone(5, melodyON[thisNote], noteDurationsON[thisNote]);
    // to distinguish the notes, set a minimum time between them.
    // the note's duration + 30% seems to work well:
    int pauseBetweenNotes = noteDurationsON[thisNote] * 1.30;
    delay(pauseBetweenNotes);
    // stop the tone playing:
    noTone(5);
  }
}

void buzzerOk()
{
  tone(5, NOTE_G5, 100);
  delay(100);
}

void buzzerFail()
{
  tone(5, NOTE_C2, 1000);
  delay(1000);
}

// https://dyrk.org/2018/12/09/arduino-simuler-un-clavier-azerty/

String fr2en(String text)
{
  int i = 0;
  String _en = " =qwertyuiopasdfghjkl;zxcvbnQWERTYUIOPASDFGHJKL:ZXCVBNm,./M<>?1234567890!@#$%^&*()",
         _fr = " =azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN,;:!?./ & \"'(- _  1234567890",
         str = "";
  while (text[i] != 0)
  {
    str = str + (String)_en[_fr.indexOf((String)text[i++])];
  }
  return str;
}

void setup()
{
  Serial.begin(9600);
  Serial.setTimeout(100);
  buzzerON();
  rfidReader.init();
  BootKeyboard.begin();

  lcd.init();      // initialize the lcd
  lcd.backlight(); // open the backlight
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Mettez");
  lcd.setCursor(0, 1);
  lcd.print("Votre badge");

  //  pinMode(2, INPUT_PULLUP);
}
// 61xNVtf84s9R0hh4XV2gWBN6aVuHaaD2?2061xNVtf84s9R0hh4XV2gWBN6aVuHaaD2???20

bool readyToWrite = false;

void loop()
{

  // check if data is available
  if (Serial.available() > 0)
  {
    // read the incoming string:
    String incomingString = Serial.readString();
    incomingString.trim();
    // prints the received data
    Serial.print("I received: ");
    Serial.println(incomingString);
    if (incomingString == "write")
    {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Mode");
      lcd.setCursor(0, 1);
      lcd.print("Ecriture");
      Serial.println("Ready to write!");
      buzzerOk();
      readyToWrite = true;
      rfidReader.unselectMifareTag();
    }
    else
    {
      if (readyToWrite)
      {
        strcpy(stringBuffer, incomingString.c_str());
        int stringSize = strlen(stringBuffer);
        Serial.println("... Waiting for tag");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Attente");
        lcd.setCursor(0, 1);
        lcd.print("Badge");
        bool success;
        do
        {
          // returns true if a Mifare tag is detected
          success = rfidReader.detectTag();
          buzzerOk();
          //delay(50); // 0.05s
        } while (!success);
        buzzerOk();
        Serial.println("Tag found!");
        result = rfidReader.writeFile(BLOCK, "token", (byte *)stringBuffer, stringSize + 1);

        if (result >= 0)
        {
          Serial.println("OK");
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Ecriture");
          lcd.setCursor(0, 1);
          lcd.print("Reussi");
          buzzerON();
        }
        else
        {
          Serial.println("Failed");
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Echec");
          lcd.setCursor(0, 1);
          lcd.print("Ecriture");
          buzzerFail();
        }
        readyToWrite = false;
        rfidReader.unselectMifareTag();
        delay(3000);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Mettez");
        lcd.setCursor(0, 1);
        lcd.print("Votre badge");
      }
    }
  }

  if (rfidReader.detectTag() && readyToWrite == false)
  {
    Serial.println("Tag detecté");
    result = rfidReader.readFile(BLOCK, "token", (byte *)stringBuffer, MAX_STRING_SIZE);
    String token = stringBuffer;
    token.trim();
    Serial.println(token);
    rfidReader.unselectMifareTag();
    if (BootKeyboard.getLeds() != 0)
    {
      BootKeyboard.write(KEY_CAPS_LOCK);
    }
    BootKeyboard.println(fr2en(token));
    buzzerOk();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Bienvenue");
    delay(3000);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Mettez");
    lcd.setCursor(0, 1);
    lcd.print("Votre badge");
  }
  // 61xNVtf84s9R0hh4XV2gWBN6aVuHaaD2???20

  /*
  if (!digitalRead(2))
  {


    Serial.println("Button Pressed");
    delay(1000);
  }
  */
}