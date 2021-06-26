#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Custom character binaries (Put your code in the brackets)
byte hearth[8] = {0x00, 0x0A, 0x1F, 0x1F, 0x0E, 0x04, 0x00, 0x00};

void setup() {
    // Custom character registration
    lcd.createChar(0, hearth);

    lcd.begin(16, 2);
    
    // Draws the custom character
    lcd.write(byte(0));
}

void loop() {}
