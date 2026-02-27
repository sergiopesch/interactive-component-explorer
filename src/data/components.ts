export interface ElectronicsComponent {
  id: string
  name: string
  category: 'passive' | 'active' | 'input' | 'output'
  hasActiveState: boolean
  description: string
  voiceDescription: string
  specs: {
    label: string
    value: string
  }[]
  circuitExample: string
  clipLabel: string
}

export const electronicsComponents: ElectronicsComponent[] = [
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'passive',
    hasActiveState: false,
    description:
      'A resistor limits the flow of electrical current in a circuit. Think of it like a narrow section in a water pipe — it slows things down. Resistors protect sensitive components from receiving too much current.',
    voiceDescription:
      'This is a resistor. It limits the flow of electrical current, protecting other components in your circuit. Resistors are one of the most common components in electronics. The colored bands on a resistor tell you its resistance value in ohms.',
    specs: [
      { label: 'Resistance', value: '220 Ω (typical for LED circuits)' },
      { label: 'Power Rating', value: '0.25 W' },
      { label: 'Tolerance', value: '± 5%' },
      { label: 'Type', value: 'Carbon Film' },
    ],
    circuitExample:
      'Connect a 220Ω resistor in series with an LED and a 5V power source. The resistor limits current to about 15mA, preventing the LED from burning out.',
    clipLabel: 'a photo of a resistor with colored bands',
  },
  {
    id: 'led',
    name: 'LED',
    category: 'output',
    hasActiveState: true,
    description:
      'An LED (Light Emitting Diode) produces light when electricity flows through it. Unlike regular bulbs, LEDs are very efficient and last a long time. They only work in one direction — the longer leg (anode) connects to positive.',
    voiceDescription:
      'This is an LED, or Light Emitting Diode. It produces light when current flows through it. LEDs are very energy efficient and are found in almost every electronic device. Remember, the longer leg is positive and the shorter leg is negative. Always use a resistor with an LED to prevent it from burning out.',
    specs: [
      { label: 'Forward Voltage', value: '2.0 V (red)' },
      { label: 'Max Current', value: '20 mA' },
      { label: 'Color', value: 'Red (625 nm)' },
      { label: 'Type', value: '5mm Through-Hole' },
    ],
    circuitExample:
      'Connect the longer leg (anode) through a 220Ω resistor to the Arduino digital pin 13. Connect the shorter leg (cathode) to GND. Use digitalWrite(13, HIGH) to turn it on.',
    clipLabel: 'a photo of a light emitting diode LED',
  },
  {
    id: 'button',
    name: 'Push Button',
    category: 'input',
    hasActiveState: true,
    description:
      'A push button is a simple switch that connects two points in a circuit when pressed. When you release it, the connection breaks. Buttons are used to give input to a circuit — like telling your Arduino to do something.',
    voiceDescription:
      'This is a push button, also called a tactile switch. When you press it, it connects the circuit and allows current to flow. When you release it, the connection breaks. Buttons are the simplest way to provide input to your Arduino projects.',
    specs: [
      { label: 'Type', value: 'Momentary Tactile' },
      { label: 'Rating', value: '12V / 50mA' },
      { label: 'Bounce Time', value: '< 5 ms' },
      { label: 'Lifespan', value: '100,000 presses' },
    ],
    circuitExample:
      'Connect one leg of the button to Arduino pin 2 and the other to GND. Enable the internal pull-up resistor with pinMode(2, INPUT_PULLUP). Read the button state with digitalRead(2).',
    clipLabel: 'a photo of a tactile push button switch',
  },
  {
    id: 'speaker',
    name: 'Piezo Speaker',
    category: 'output',
    hasActiveState: true,
    description:
      'A piezo speaker (buzzer) makes sound by vibrating a small disc very quickly. By changing how fast it vibrates (the frequency), you can produce different musical notes. It is great for adding audio feedback to projects.',
    voiceDescription:
      'This is a piezo speaker, sometimes called a buzzer. It produces sound by vibrating a small ceramic disc at different frequencies. You can play simple melodies or use it for alarms and notifications. Connect it to a digital pin on your Arduino and use the tone function to play notes.',
    specs: [
      { label: 'Voltage', value: '3 – 30 V' },
      { label: 'Frequency Range', value: '2 – 4 kHz' },
      { label: 'Sound Level', value: '~ 85 dB' },
      { label: 'Type', value: 'Passive Piezo' },
    ],
    circuitExample:
      'Connect the positive pin of the speaker to Arduino pin 8 and the negative pin to GND. Use tone(8, 440, 500) to play an A4 note (440 Hz) for half a second.',
    clipLabel: 'a photo of a piezo buzzer speaker',
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    category: 'passive',
    hasActiveState: false,
    description:
      'A capacitor stores electrical energy temporarily, like a tiny rechargeable battery. It charges up when current flows in and releases that energy when needed. Capacitors smooth out voltage fluctuations and are essential in almost every circuit.',
    voiceDescription:
      'This is a capacitor. It stores electrical energy temporarily and releases it when needed. Think of it like a small rechargeable battery. Capacitors are used to smooth out power supply fluctuations and filter signals. The electrolytic type has a polarity — the longer leg is positive.',
    specs: [
      { label: 'Capacitance', value: '100 μF' },
      { label: 'Voltage Rating', value: '25 V' },
      { label: 'Type', value: 'Electrolytic' },
      { label: 'Tolerance', value: '± 20%' },
    ],
    circuitExample:
      'Place a 100μF capacitor across the power rails of your breadboard (positive to 5V, negative to GND). This stabilizes the voltage and protects sensitive components from power spikes.',
    clipLabel: 'a photo of an electrolytic capacitor',
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'input',
    hasActiveState: false,
    description:
      'A potentiometer is a variable resistor with a knob you can turn. Rotating the knob changes the resistance, which lets you control things like volume, brightness, or speed. It has three pins — two outer pins and one middle wiper pin.',
    voiceDescription:
      'This is a potentiometer, often called a pot. It is a variable resistor that you control by turning a knob. As you rotate it, the resistance changes smoothly, which lets you adjust things like volume or LED brightness. It has three pins: connect the outer two to power and ground, and read the middle pin with an analog input.',
    specs: [
      { label: 'Resistance Range', value: '0 – 10 kΩ' },
      { label: 'Type', value: 'Rotary (Linear Taper)' },
      { label: 'Rotation', value: '270°' },
      { label: 'Power Rating', value: '0.5 W' },
    ],
    circuitExample:
      'Connect the left pin to 5V, the right pin to GND, and the middle pin to Arduino analog pin A0. Use analogRead(A0) to read a value from 0 to 1023 as you turn the knob.',
    clipLabel: 'a photo of a potentiometer rotary knob',
  },
  {
    id: 'diode',
    name: 'Diode',
    category: 'passive',
    hasActiveState: false,
    description:
      'A diode is like a one-way valve for electricity — it only allows current to flow in one direction. The stripe on the body marks the cathode (negative) end. Diodes protect circuits from reverse voltage and are used in power supplies.',
    voiceDescription:
      'This is a diode. It acts as a one-way valve, allowing electrical current to flow in only one direction. The stripe or band on the diode marks the cathode, which is the negative end. Diodes are essential for protecting circuits from reverse polarity and are a key building block in power supply circuits.',
    specs: [
      { label: 'Type', value: '1N4007 Rectifier' },
      { label: 'Max Voltage', value: '1000 V (reverse)' },
      { label: 'Max Current', value: '1 A (forward)' },
      { label: 'Forward Drop', value: '0.7 V' },
    ],
    circuitExample:
      'Place a 1N4007 diode in series with a DC motor, with the stripe facing the positive supply. This protects your Arduino from voltage spikes when the motor turns off.',
    clipLabel: 'a photo of a diode electronic component',
  },
  {
    id: 'transistor',
    name: 'Transistor',
    category: 'active',
    hasActiveState: false,
    description:
      'A transistor is like an electronic switch or amplifier. A small current at the base pin controls a much larger current flowing between the collector and emitter. Transistors are the building blocks of all modern computers and electronics.',
    voiceDescription:
      'This is a transistor. It is one of the most important inventions in electronics. A transistor acts as an electronic switch or signal amplifier. By applying a small current to the base pin, you can control a much larger current flowing between the collector and emitter pins. This is how your Arduino controls motors and other high-power devices.',
    specs: [
      { label: 'Type', value: 'NPN (2N2222)' },
      { label: 'Max Collector Current', value: '800 mA' },
      { label: 'Max Voltage (CE)', value: '40 V' },
      { label: 'Gain (hFE)', value: '100 – 300' },
    ],
    circuitExample:
      'Connect the emitter to GND, the collector to one motor terminal (other terminal to 5V), and the base through a 1kΩ resistor to Arduino pin 9. Use digitalWrite(9, HIGH) to turn the motor on.',
    clipLabel: 'a photo of a transistor electronic component',
  },
  {
    id: 'servo',
    name: 'Servo Motor',
    category: 'output',
    hasActiveState: true,
    description:
      'A servo motor is a small motor that can rotate to a specific angle and hold that position. Unlike regular motors that spin continuously, servos are precise — you tell them exactly where to point. They are used in robotics, RC cars, and automation.',
    voiceDescription:
      'This is a servo motor. Unlike regular motors, a servo can rotate to a precise angle and hold that position. You control it by sending a pulse-width modulated signal. Servos are commonly used in robotics for arms, legs, and steering. Most hobby servos rotate from 0 to 180 degrees.',
    specs: [
      { label: 'Type', value: 'SG90 Micro Servo' },
      { label: 'Rotation Range', value: '0° – 180°' },
      { label: 'Torque', value: '1.8 kg·cm' },
      { label: 'Voltage', value: '4.8 – 6.0 V' },
    ],
    circuitExample:
      'Connect the red wire to 5V, the brown wire to GND, and the orange signal wire to Arduino pin 9. Use the Servo library: myServo.attach(9) then myServo.write(90) to move to 90 degrees.',
    clipLabel: 'a photo of a servo motor',
  },
  {
    id: 'dc-motor',
    name: 'DC Motor',
    category: 'output',
    hasActiveState: true,
    description:
      'A DC motor converts electrical energy into continuous rotation. When you apply voltage, the shaft spins. Reverse the voltage and it spins the other way. DC motors are found in fans, toys, and electric vehicles.',
    voiceDescription:
      'This is a DC motor. It converts electrical energy into rotational motion. When you apply voltage across its two terminals, the shaft spins continuously. Reverse the polarity and it spins the other direction. DC motors draw more current than your Arduino can provide directly, so you need a transistor or motor driver to control them.',
    specs: [
      { label: 'Voltage', value: '3 – 6 V' },
      { label: 'No-Load Speed', value: '~15,000 RPM' },
      { label: 'Current (no load)', value: '70 mA' },
      { label: 'Type', value: 'Brushed DC' },
    ],
    circuitExample:
      'Use an NPN transistor as a switch: connect the motor between 5V and the collector, emitter to GND, and base through a 1kΩ resistor to Arduino pin 9. Add a flyback diode across the motor.',
    clipLabel: 'a photo of a small DC electric motor',
  },
  {
    id: 'photoresistor',
    name: 'Photoresistor (LDR)',
    category: 'input',
    hasActiveState: false,
    description:
      'A photoresistor (Light Dependent Resistor) changes its resistance based on how much light hits it. In bright light, resistance drops low; in darkness, it rises high. It is a simple and fun way to make your project respond to light.',
    voiceDescription:
      'This is a photoresistor, also called an LDR or Light Dependent Resistor. Its resistance changes depending on how much light shines on it. In bright light, the resistance is low, around a few hundred ohms. In the dark, it rises to over 10,000 ohms. You can use it to make automatic night lights or light-following robots.',
    specs: [
      { label: 'Light Resistance', value: '~200 Ω' },
      { label: 'Dark Resistance', value: '~10 kΩ' },
      { label: 'Peak Wavelength', value: '540 nm (green)' },
      { label: 'Type', value: 'CdS Photocell' },
    ],
    circuitExample:
      'Create a voltage divider: connect one leg of the LDR to 5V and the other to both a 10kΩ resistor (to GND) and Arduino analog pin A0. Use analogRead(A0) to measure light level.',
    clipLabel: 'a photo of a photoresistor light dependent resistor',
  },
  {
    id: 'temp-sensor',
    name: 'Temperature Sensor',
    category: 'input',
    hasActiveState: false,
    description:
      'A temperature sensor measures how hot or cold it is and outputs a voltage proportional to the temperature. The TMP36 is popular with Arduino because it is simple — no extra components needed. It reads from −40°C to +125°C.',
    voiceDescription:
      'This is a temperature sensor, specifically a TMP36. It measures the ambient temperature and outputs a voltage that you can read with your Arduino. For every degree Celsius, the output changes by 10 millivolts. It is easy to use — just power it and read the analog voltage. No calibration needed.',
    specs: [
      { label: 'Type', value: 'TMP36 Analog' },
      { label: 'Range', value: '−40°C to +125°C' },
      { label: 'Accuracy', value: '± 1°C' },
      { label: 'Output Scale', value: '10 mV/°C' },
    ],
    circuitExample:
      'Connect the left pin to 5V, the right pin to GND, and the middle pin to Arduino analog pin A0. Convert the reading: tempC = (analogRead(A0) * 5.0 / 1024.0 - 0.5) * 100.',
    clipLabel: 'a photo of a temperature sensor electronic component',
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic Sensor',
    category: 'input',
    hasActiveState: false,
    description:
      'An ultrasonic sensor measures distance by sending out a sound pulse and timing how long it takes to bounce back — just like a bat. The HC-SR04 can measure from 2 cm to 4 meters. Great for obstacle detection and robotics.',
    voiceDescription:
      'This is an ultrasonic distance sensor, specifically an HC-SR04. It works like sonar — it sends out an ultrasonic sound pulse and measures how long it takes for the echo to return. From that time, you can calculate the distance to an object. It can measure distances from about 2 centimeters to 4 meters.',
    specs: [
      { label: 'Type', value: 'HC-SR04' },
      { label: 'Range', value: '2 cm – 400 cm' },
      { label: 'Accuracy', value: '± 3 mm' },
      { label: 'Trigger Pulse', value: '10 μs' },
    ],
    circuitExample:
      'Connect VCC to 5V, GND to GND, Trig to pin 9, Echo to pin 10. Send a 10μs HIGH pulse on Trig, then use pulseIn(10, HIGH) to measure the echo time. Distance = time × 0.034 / 2 cm.',
    clipLabel: 'a photo of an ultrasonic distance sensor HC-SR04',
  },
  {
    id: 'lcd',
    name: 'LCD Display',
    category: 'output',
    hasActiveState: false,
    description:
      'An LCD display shows text and numbers on a small screen. The 16×2 LCD has two rows of 16 characters each. It is the easiest way to show sensor readings, messages, or menus without needing a computer screen.',
    voiceDescription:
      'This is an LCD display, a 16 by 2 character screen. It can display two rows of 16 characters each. LCDs are the simplest way to show text output from your Arduino, like sensor readings or status messages. They use the Liquid Crystal library and typically need 6 or more pins, though an I2C adapter can reduce that to just two.',
    specs: [
      { label: 'Type', value: '16×2 Character LCD' },
      { label: 'Controller', value: 'HD44780' },
      { label: 'Backlight', value: 'LED (blue or green)' },
      { label: 'Voltage', value: '5 V' },
    ],
    circuitExample:
      'Wire RS to pin 12, Enable to pin 11, D4-D7 to pins 5-2. Include a 10kΩ potentiometer on the contrast pin (V0). Use LiquidCrystal library: lcd.begin(16, 2) then lcd.print("Hello!").',
    clipLabel: 'a photo of an LCD display screen module',
  },
  {
    id: 'relay',
    name: 'Relay',
    category: 'active',
    hasActiveState: true,
    description:
      'A relay is an electrically-controlled switch. A small signal from your Arduino activates an electromagnet inside, which flips a mechanical switch to control high-power devices like lamps, fans, or appliances safely.',
    voiceDescription:
      'This is a relay module. A relay is an electrically-controlled switch that lets your low-power Arduino safely control high-power devices like lamps, fans, or appliances. When you send a signal, an electromagnet inside flips a mechanical switch. You can hear a clicking sound when it activates. Always be careful with relays connected to mains electricity.',
    specs: [
      { label: 'Control Voltage', value: '5 V DC' },
      { label: 'Switching Capacity', value: '10 A @ 250 V AC' },
      { label: 'Trigger Current', value: '~ 70 mA' },
      { label: 'Type', value: 'SPDT (Single Pole Double Throw)' },
    ],
    circuitExample:
      'Connect the relay VCC to 5V, GND to GND, and IN to Arduino pin 7. Use digitalWrite(7, HIGH) to activate the relay. The COM and NO terminals form a switch for your high-power circuit.',
    clipLabel: 'a photo of a relay module',
  },
  {
    id: 'rgb-led',
    name: 'RGB LED',
    category: 'output',
    hasActiveState: true,
    description:
      'An RGB LED is actually three tiny LEDs (red, green, blue) in one package. By mixing different brightness levels of each color, you can create virtually any color. It has four legs — one common pin and one for each color.',
    voiceDescription:
      'This is an RGB LED. It contains three tiny LEDs in one package: red, green, and blue. By controlling the brightness of each color using PWM, you can mix them to create any color you want. Common cathode types share a ground pin, while common anode types share a positive pin. Use analogWrite to set each color channel from 0 to 255.',
    specs: [
      { label: 'Type', value: '5mm Common Cathode' },
      { label: 'Red Forward Voltage', value: '2.0 V' },
      { label: 'Green Forward Voltage', value: '3.2 V' },
      { label: 'Blue Forward Voltage', value: '3.2 V' },
    ],
    circuitExample:
      'Connect the longest leg (cathode) to GND. Connect R, G, B legs through 220Ω resistors to Arduino pins 9, 10, 11. Use analogWrite(9, 255) for red, analogWrite(10, 255) for green, etc.',
    clipLabel: 'a photo of an RGB LED light emitting diode',
  },
]
