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
  },
]
