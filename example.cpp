#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Custom character binarys (Put your code in the brackets)
const char hearth[8] PROGMEM = {0x00, 0x0A, 0x1F, 0x1F, 0x0E, 0x04, 0x00, 0x00};

void setup()
{
    lcd.init();

    // Custom character registration
    lcd.createChar(0, hearth);
}

void loop()
{
    lcd.setCursor(0, 0);

    // Draws the custom character
    lcd.write(0);

    delay(500);
}
