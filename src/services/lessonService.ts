import type { CreateLessonPayload, LessonHistoryItem, StudentProfile } from '../types/lesson';
import type { TeachingSlide } from '../types/teaching';

export const MOCK_STUDENT: StudentProfile = {
  id: 'usr_alex_09',
  name: 'Alex Rivera',
  email: 'alex.rivera@stanford.edu',
  streakDays: 6,
  totalLessonsCompleted: 14
};

export const NEWTON_LESSON_SLIDES: TeachingSlide[] = [
  {
    id: 'newton-01',
    slideNumber: 1,
    title: 'Introduction to Classical Mechanics',
    subtitle: 'The Three Laws that Governed the Physical Universe for 300 Years',
    audioDuration: 15,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-1',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Core Foundation',
        content: "Newton's Laws of Motion"
      },
      {
        id: 'def-1',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 54, height: 32 },
        animationDelay: 2.0,
        animationType: 'slide-up',
        title: 'Historical & Scientific Milestone',
        content: 'Published by Sir Isaac Newton in 1687 in the Principia Mathematica, these three fundamental laws describe the precise mathematical relationship between any physical body and the forces acting upon it.',
        highlightWords: ['1687', 'Principia Mathematica', 'mathematical relationship', 'forces']
      },
      {
        id: 'note-1',
        componentType: 'note-box',
        position: { x: 63, y: 12 },
        dimensions: { width: 31, height: 74 },
        animationDelay: 4.5,
        animationType: 'fade-in',
        title: 'Classroom Objectives',
        content: '1. Understand the concept of Net Force (ΣF)\n2. Formulate the Law of Inertia (1st Law)\n3. Calculate dynamics with F = ma (2nd Law)\n4. Unpack Action-Reaction Pairs (3rd Law)\n5. Solve real-world mechanical systems.'
      },
      {
        id: 'expl-1',
        componentType: 'explanation',
        position: { x: 6, y: 60 },
        dimensions: { width: 54, height: 26 },
        animationDelay: 7.5,
        animationType: 'glow-pulse',
        title: 'Why This Matters Today',
        content: 'From launching satellites into orbit and designing aerodynamic sports cars to understanding biomechanics in athletics, Newton’s mechanics remain the engineering bedrock of our modern world.'
      }
    ],
    transcript: [
      {
        id: 't-n1-01',
        startTime: 0,
        endTime: 4.5,
        speaker: 'tutor',
        text: "Hello Alex, and welcome to today's masterclass on Newton's Laws of Motion."
      },
      {
        id: 't-n1-02',
        startTime: 4.6,
        endTime: 9.8,
        speaker: 'tutor',
        text: 'In 1687, Isaac Newton published the Principia, forever transforming natural philosophy into an exact mathematical science.'
      },
      {
        id: 't-n1-03',
        startTime: 9.9,
        endTime: 15.0,
        speaker: 'tutor',
        text: 'Over the next 8 slides, we will dissect each law visually, write the equations, and test your intuition with interactive whiteboard derivations.'
      }
    ]
  },
  {
    id: 'newton-02',
    slideNumber: 2,
    title: 'What is a Force?',
    subtitle: 'Vector Nature of Forces and Free-Body Equilibrium',
    audioDuration: 16,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-2',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Physics Definition',
        content: 'Forces: Pushes, Pulls & Vectors'
      },
      {
        id: 'def-2',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 52, height: 28 },
        animationDelay: 2.0,
        animationType: 'slide-up',
        title: 'Formal Definition',
        content: 'A force is an interaction that, when unopposed, changes the motion of an object. Force is a vector quantity with both Magnitude (in Newtons, N) and Direction (θ).',
        highlightWords: ['interaction', 'vector quantity', 'Magnitude', 'Direction', 'Newtons']
      },
      {
        id: 'diagram-2',
        componentType: 'diagram',
        position: { x: 61, y: 14 },
        dimensions: { width: 33, height: 42 },
        animationDelay: 4.5,
        animationType: 'scale-in',
        title: 'Force Classification',
        content: '• Contact Forces:\n  - Normal Force (N)\n  - Friction (f)\n  - Tension (T)\n  - Applied (F_app)\n\n• Field / Non-Contact:\n  - Gravity (F_g = mg)\n  - Electromagnetic\n  - Strong & Weak Nuclear'
      },
      {
        id: 'formula-2',
        componentType: 'formula',
        position: { x: 6, y: 56 },
        dimensions: { width: 52, height: 30 },
        animationDelay: 8.0,
        animationType: 'glow-pulse',
        title: 'Net Force (Resultant Vector)',
        content: 'ΣF = F₁ + F₂ + ... + Fₙ = 0  (Equilibrium Condition)'
      }
    ],
    transcript: [
      {
        id: 't-n2-01',
        startTime: 0,
        endTime: 4.8,
        speaker: 'tutor',
        text: 'Before we can state the laws of motion, we must define what a force actually is in rigorous physics terms.'
      },
      {
        id: 't-n2-02',
        startTime: 4.9,
        endTime: 10.2,
        speaker: 'tutor',
        text: 'A force is not just a push or pull—it is a vector. This means the direction in which you apply a force is just as important as its magnitude.'
      },
      {
        id: 't-n2-03',
        startTime: 10.3,
        endTime: 16.0,
        speaker: 'tutor',
        text: 'When all forces acting on a body add up to zero, we say the system is in mechanical equilibrium. Now let us see what happens when forces balance!'
      }
    ]
  },
  {
    id: 'newton-03',
    slideNumber: 3,
    title: "Newton's First Law of Motion",
    subtitle: 'The Law of Inertia & The Natural State of Motion',
    audioDuration: 18,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-3',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'First Axiom of Dynamics',
        content: "The Law of Inertia"
      },
      {
        id: 'def-3',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 54, height: 32 },
        animationDelay: 2.0,
        animationType: 'slide-up',
        title: 'Statement of the Law',
        content: 'An object at rest will remain at rest, and an object in uniform motion with constant velocity will continue in motion along a straight line, unless acted upon by a non-zero net external force (ΣF ≠ 0).',
        highlightWords: ['at rest', 'uniform motion', 'constant velocity', 'straight line', 'net external force']
      },
      {
        id: 'flowchart-3',
        componentType: 'flowchart',
        position: { x: 62, y: 14 },
        dimensions: { width: 32, height: 72 },
        animationDelay: 5.0,
        animationType: 'fade-in',
        title: 'Logical Decision Tree',
        content: 'Is Net Force ΣF = 0?\n\nYES ➔ Acceleration a = 0\n  • If v = 0 ➔ Remains at rest\n  • If v > 0 ➔ Constant speed & straight direction\n\nNO (ΣF ≠ 0) ➔ a ≠ 0\n  • Speed changes OR\n  • Direction changes'
      },
      {
        id: 'note-3',
        componentType: 'note-box',
        position: { x: 6, y: 60 },
        dimensions: { width: 54, height: 26 },
        animationDelay: 9.0,
        animationType: 'fade-in',
        title: 'Aristotle vs Galileo & Newton',
        content: 'Aristotle believed an object required continuous force to keep moving. Galileo and Newton proved friction is the hidden external force stopping objects on Earth!'
      }
    ],
    transcript: [
      {
        id: 't-n3-01',
        startTime: 0,
        endTime: 5.5,
        speaker: 'tutor',
        text: "Newton's First Law is also known as the Law of Inertia. It dismantled over 2,000 years of incorrect Aristotelian intuition."
      },
      {
        id: 't-n3-02',
        startTime: 5.6,
        endTime: 11.5,
        speaker: 'tutor',
        text: 'It states that if the net external force acting on a body is zero, its velocity vector cannot change. A stationary book stays stationary; a Voyager space probe glides eternally through deep space.'
      },
      {
        id: 't-n3-03',
        startTime: 11.6,
        endTime: 18.0,
        speaker: 'tutor',
        text: 'Objects do not naturally slow down on their own—they only slow down when friction or air resistance exerts an opposing force.'
      }
    ]
  },
  {
    id: 'newton-04',
    slideNumber: 4,
    title: 'Inertia and Mass',
    subtitle: 'Why Mass is the Quantitative Measure of Inertia',
    audioDuration: 15,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-4',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Physical Property',
        content: 'Inertia: Resistance to Acceleration'
      },
      {
        id: 'def-4',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 52, height: 30 },
        animationDelay: 2.0,
        animationType: 'slide-up',
        title: 'Inertia Defined',
        content: 'Inertia is the natural tendency of an object to resist any change in its velocity (whether speeding up, slowing down, or turning). Mass (m, in kg) is the scalar measurement of this inertia.',
        highlightWords: ['resist any change', 'velocity', 'Mass', 'scalar measurement']
      },
      {
        id: 'explanation-4',
        componentType: 'explanation',
        position: { x: 60, y: 14 },
        dimensions: { width: 34, height: 72 },
        animationDelay: 5.0,
        animationType: 'fade-in',
        title: 'Thought Experiment: Boulder vs Tennis Ball',
        content: 'Imagine kicking a 50 kg granite boulder vs a 0.05 kg tennis ball in zero-gravity:\n\n• Gravity is zero, yet the boulder is still 1,000 times harder to accelerate!\n\n• Mass resists acceleration regardless of gravitational field.'
      },
      {
        id: 'formula-4',
        componentType: 'formula',
        position: { x: 6, y: 58 },
        dimensions: { width: 52, height: 28 },
        animationDelay: 8.5,
        animationType: 'glow-pulse',
        title: 'Mass vs Weight Distinction',
        content: 'Mass (m) = Inherent property (kg)\nWeight (W = mg) = Gravitational force (N)'
      }
    ],
    transcript: [
      {
        id: 't-n4-01',
        startTime: 0,
        endTime: 4.5,
        speaker: 'tutor',
        text: 'Now let us ask a crucial question: What determines how much inertia an object possesses?'
      },
      {
        id: 't-n4-02',
        startTime: 4.6,
        endTime: 9.8,
        speaker: 'tutor',
        text: 'The answer is Mass. Mass is quite literally the quantitative metric of inertia. More mass means greater resistance to being accelerated.'
      },
      {
        id: 't-n4-03',
        startTime: 9.9,
        endTime: 15.0,
        speaker: 'tutor',
        text: 'Even floating in the microgravity of space, a massive cargo container requires enormous thruster force to get moving, because its inertial mass remains unchanged.'
      }
    ]
  },
  {
    id: 'newton-05',
    slideNumber: 5,
    title: "Newton's Second Law of Motion",
    subtitle: 'The Fundamental Equation of Classical Dynamics',
    audioDuration: 17,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-5',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Quantitative Dynamics',
        content: "Force, Mass, and Acceleration"
      },
      {
        id: 'def-5',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 54, height: 32 },
        animationDelay: 2.0,
        animationType: 'slide-up',
        title: 'Second Law Statement',
        content: 'The acceleration (a) of a body is directly proportional to the net force (ΣF) acting on it, in the direction of the net force, and inversely proportional to its mass (m).',
        highlightWords: ['acceleration', 'directly proportional', 'net force', 'inversely proportional', 'mass']
      },
      {
        id: 'formula-5',
        componentType: 'formula',
        position: { x: 6, y: 60 },
        dimensions: { width: 54, height: 26 },
        animationDelay: 5.5,
        animationType: 'glow-pulse',
        title: 'The Master Equation',
        content: 'ΣF = m · a   ⟺   a = ΣF / m'
      },
      {
        id: 'diagram-5',
        componentType: 'diagram',
        position: { x: 63, y: 14 },
        dimensions: { width: 31, height: 72 },
        animationDelay: 8.5,
        animationType: 'fade-in',
        title: 'Proportional Relationships',
        content: '1. Double the Force (2F):\n   ➔ Acceleration doubles (2a)\n\n2. Double the Mass (2m):\n   ➔ Acceleration is halved (a/2)\n\n3. Direction:\n   ➔ Vector a is always parallel to vector ΣF'
      }
    ],
    transcript: [
      {
        id: 't-n5-01',
        startTime: 0,
        endTime: 5.0,
        speaker: 'tutor',
        text: "What happens when the net external force is not zero? This brings us to Newton's celebrated Second Law."
      },
      {
        id: 't-n5-02',
        startTime: 5.1,
        endTime: 11.0,
        speaker: 'tutor',
        text: 'The Second Law provides the quantitative bridge: the net force equals the mass of the body multiplied by its acceleration vector.'
      },
      {
        id: 't-n5-03',
        startTime: 11.1,
        endTime: 17.0,
        speaker: 'tutor',
        text: 'If you double the applied net force, acceleration doubles. If you double the payload mass, acceleration drops by half. Let us look closely at units on the next slide.'
      }
    ]
  },
  {
    id: 'newton-06',
    slideNumber: 6,
    title: 'Mathematical Formulation & Units: F = ma',
    subtitle: 'Derivation, Dimensional Analysis & Free-Body Vectors',
    audioDuration: 16,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-6',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'SI Unit Analysis',
        content: 'Defining the Newton (N)'
      },
      {
        id: 'formula-6',
        componentType: 'formula',
        position: { x: 6, y: 24 },
        dimensions: { width: 52, height: 32 },
        animationDelay: 1.8,
        animationType: 'glow-pulse',
        title: 'Unit Equivalences',
        content: '1 Newton (N) = 1 kg · m / s²\n\nForce needed to accelerate a 1 kg mass at 1 m/s².'
      },
      {
        id: 'explanation-6',
        componentType: 'explanation',
        position: { x: 60, y: 14 },
        dimensions: { width: 34, height: 72 },
        animationDelay: 4.5,
        animationType: 'slide-up',
        title: 'Step-by-Step Sample Problem',
        content: 'Problem:\nA 1,200 kg electric vehicle accelerates from 0 to 20 m/s in 4.0 seconds. Find the net driving force.\n\n1. Calculate a:\n   a = Δv / Δt = 20 / 4 = 5.0 m/s²\n\n2. Apply 2nd Law:\n   F_net = m · a\n   F_net = 1,200 kg × 5.0 m/s²\n   F_net = 6,000 N'
      },
      {
        id: 'note-6',
        componentType: 'note-box',
        position: { x: 6, y: 60 },
        dimensions: { width: 52, height: 26 },
        animationDelay: 8.0,
        animationType: 'fade-in',
        title: 'Calculus Generalization',
        content: 'In general relativity and variable-mass systems (like rockets burning fuel), Newton originally stated: F = dp/dt (rate of change of momentum).'
      }
    ],
    transcript: [
      {
        id: 't-n6-01',
        startTime: 0,
        endTime: 4.5,
        speaker: 'tutor',
        text: 'Let us ground this mathematically. One Newton of force is defined precisely as one kilogram-meter per second squared.'
      },
      {
        id: 't-n6-02',
        startTime: 4.6,
        endTime: 10.2,
        speaker: 'tutor',
        text: 'Look at the sample problem on the right. An electric car accelerating at 5 meters per second squared requires six thousand Newtons of net traction.'
      },
      {
        id: 't-n6-03',
        startTime: 10.3,
        endTime: 16.0,
        speaker: 'tutor',
        text: 'You can test this equation yourself using our interactive whiteboard tools at any point during this lecture.'
      }
    ]
  },
  {
    id: 'newton-07',
    slideNumber: 7,
    title: "Newton's Third Law of Motion",
    subtitle: 'Action and Reaction: The Symmetry of Physical Interactions',
    audioDuration: 18,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-7',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Action-Reaction Principle',
        content: 'Interactions Occur in Equal & Opposite Pairs'
      },
      {
        id: 'def-7',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 54, height: 32 },
        animationDelay: 2.0,
        animationType: 'slide-up',
        title: 'Third Law Statement',
        content: 'Whenever one object exerts a force on a second object (Action), the second object simultaneously exerts a force of equal magnitude and opposite direction on the first object (Reaction).',
        highlightWords: ['simultaneously', 'equal magnitude', 'opposite direction', 'Action', 'Reaction']
      },
      {
        id: 'formula-7',
        componentType: 'formula',
        position: { x: 6, y: 60 },
        dimensions: { width: 54, height: 26 },
        animationDelay: 5.5,
        animationType: 'glow-pulse',
        title: 'Vector Equation',
        content: 'F_A on B = - F_B on A'
      },
      {
        id: 'diagram-7',
        componentType: 'diagram',
        position: { x: 63, y: 14 },
        dimensions: { width: 31, height: 72 },
        animationDelay: 8.5,
        animationType: 'fade-in',
        title: 'Why Don’t They Cancel?',
        content: 'CRITICAL RULE:\nAction and Reaction forces NEVER cancel each other because they act on TWO DIFFERENT BODIES.\n\n• Action: Hand pushes wall\n• Reaction: Wall pushes hand\n\nBecause they act on separate bodies, each body experiences net acceleration!'
      }
    ],
    transcript: [
      {
        id: 't-n7-01',
        startTime: 0,
        endTime: 5.2,
        speaker: 'tutor',
        text: 'Now we arrive at the most frequently misunderstood law in all of introductory physics: Newton’s Third Law.'
      },
      {
        id: 't-n7-02',
        startTime: 5.3,
        endTime: 11.5,
        speaker: 'tutor',
        text: 'For every action, there is an equal and opposite reaction. Forces never exist in isolation; they are mutual interactions between pairs of bodies.'
      },
      {
        id: 't-n7-03',
        startTime: 11.6,
        endTime: 18.0,
        speaker: 'tutor',
        text: 'Crucially, remember: action and reaction forces never cancel each other because they act on separate objects. Let us see how this enables rockets to fly!'
      }
    ]
  },
  {
    id: 'newton-08',
    slideNumber: 8,
    title: 'Real-World Applications & Systems',
    subtitle: 'From Rocket Propulsion to Walking and Orbital Dynamics',
    audioDuration: 16,
    tutorMood: 'explaining',
    elements: [
      {
        id: 'heading-8',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Applied Engineering',
        content: 'Newtonian Physics in Action'
      },
      {
        id: 'explanation-8',
        componentType: 'explanation',
        position: { x: 6, y: 24 },
        dimensions: { width: 44, height: 62 },
        animationDelay: 1.8,
        animationType: 'slide-up',
        title: '1. Rocket Propulsion in Space',
        content: 'A rocket in space pushes hot exhaust gases backward at high velocity (Action). The exhaust gas pushes the rocket forward (Reaction). No air is needed to push against!'
      },
      {
        id: 'explanation-8b',
        componentType: 'explanation',
        position: { x: 53, y: 24 },
        dimensions: { width: 41, height: 62 },
        animationDelay: 4.8,
        animationType: 'slide-up',
        title: '2. Biomechanics of Walking',
        content: 'When you take a step, your foot pushes backward against the ground. Friction with the ground pushes forward on your foot, propelling your center of mass forward.'
      }
    ],
    transcript: [
      {
        id: 't-n8-01',
        startTime: 0,
        endTime: 5.0,
        speaker: 'tutor',
        text: 'Let us see how all three laws work together in real-world aerospace and everyday mechanics.'
      },
      {
        id: 't-n8-02',
        startTime: 5.1,
        endTime: 10.5,
        speaker: 'tutor',
        text: 'A rocket engine expels billions of high-velocity gas particles out of its nozzle. The reaction force propels the starship through the frictionless void of space.'
      },
      {
        id: 't-n8-03',
        startTime: 10.6,
        endTime: 16.0,
        speaker: 'tutor',
        text: 'Even walking across the room relies on the third law: your shoes push the Earth backward, and the Earth pushes you forward!'
      }
    ]
  },
  {
    id: 'newton-09',
    slideNumber: 9,
    title: 'Comprehensive Summary & Quick Recap',
    subtitle: 'The Unified Framework of Newtonian Classical Mechanics',
    audioDuration: 15,
    tutorMood: 'celebrating',
    elements: [
      {
        id: 'heading-9',
        componentType: 'heading',
        position: { x: 6, y: 10 },
        dimensions: { width: 56, height: 10 },
        animationDelay: 0.2,
        animationType: 'fade-in',
        title: 'Classroom Review',
        content: "Mastery Summary: The 3 Laws"
      },
      {
        id: 'def-9',
        componentType: 'definition',
        position: { x: 6, y: 24 },
        dimensions: { width: 28, height: 62 },
        animationDelay: 1.5,
        animationType: 'slide-up',
        title: '1st Law (Inertia)',
        content: 'ΣF = 0 ➔ a = 0\n\nObjects maintain their velocity unless disrupted by net external force. Mass is the measure of inertia.'
      },
      {
        id: 'formula-9',
        componentType: 'formula',
        position: { x: 36, y: 24 },
        dimensions: { width: 28, height: 62 },
        animationDelay: 4.0,
        animationType: 'slide-up',
        title: '2nd Law (Dynamics)',
        content: 'ΣF = m · a\n\nNet force causes acceleration proportional to force magnitude and inversely proportional to mass.'
      },
      {
        id: 'note-9',
        componentType: 'note-box',
        position: { x: 66, y: 24 },
        dimensions: { width: 28, height: 62 },
        animationDelay: 7.0,
        animationType: 'slide-up',
        title: '3rd Law (Interaction)',
        content: 'F_AB = - F_BA\n\nForces always exist in matched pairs acting on separate bodies. Action equals Reaction.'
      }
    ],
    transcript: [
      {
        id: 't-n9-01',
        startTime: 0,
        endTime: 4.5,
        speaker: 'tutor',
        text: 'Outstanding work today Alex! You have completed the foundation of classical dynamics.'
      },
      {
        id: 't-n9-02',
        startTime: 4.6,
        endTime: 10.0,
        speaker: 'tutor',
        text: 'Remember these three pillars: Inertia when forces balance, F equals m-a when forces are unbalanced, and matched Action-Reaction for all interactions.'
      },
      {
        id: 't-n9-03',
        startTime: 10.1,
        endTime: 15.0,
        speaker: 'tutor',
        text: 'Feel free to save this slide, review your notes, or ask any remaining doubts using the doubt panel!'
      }
    ]
  }
];

export const MOCK_LESSONS: LessonHistoryItem[] = [
  {
    id: 'les_newton_01',
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    date: 'Sep 28, 2026',
    durationMinutes: 16,
    progress: 12,
    lastAccessed: 'Active Session',
    totalSlides: 9,
    completedSlides: 1,
    description: "Master inertia, the foundational dynamics equation F = ma, and action-reaction symmetry with interactive 3D AI lectures.",
    thumbnailGradient: 'from-indigo-900/40 via-blue-900/30 to-slate-950/60'
  },
  {
    id: 'les_quantum_01',
    title: 'Quantum Superposition & Qubits',
    subject: 'Quantum Physics',
    date: 'Sep 26, 2026',
    durationMinutes: 18,
    progress: 85,
    lastAccessed: 'Yesterday at 4:32 PM',
    totalSlides: 12,
    completedSlides: 10,
    description: 'Explore state vectors, Bloch spheres, and wave-particle duality with step-by-step mathematical intuition.',
    thumbnailGradient: 'from-cyan-900/40 via-blue-900/30 to-indigo-950/60'
  },
  {
    id: 'les_neuro_02',
    title: 'Transformer Architecture & Self-Attention',
    subject: 'Artificial Intelligence',
    date: 'Sep 24, 2026',
    durationMinutes: 25,
    progress: 100,
    lastAccessed: '3 days ago',
    totalSlides: 14,
    completedSlides: 14,
    description: 'Detailed breakdown of Scaled Dot-Product Attention, Multi-Head projections, and positional embeddings.',
    thumbnailGradient: 'from-purple-900/40 via-violet-900/30 to-slate-950/60'
  },
  {
    id: 'les_bio_03',
    title: 'CRISPR-Cas9 & Gene Editing Mechanics',
    subject: 'Molecular Biology',
    date: 'Sep 20, 2026',
    durationMinutes: 15,
    progress: 42,
    lastAccessed: 'Last week',
    totalSlides: 10,
    completedSlides: 4,
    description: 'Guide RNA target recognition, PAM sequence binding, and double-strand break repair pathways.',
    thumbnailGradient: 'from-emerald-900/40 via-teal-900/30 to-zinc-950/60'
  }
];

// Cache of dynamically generated slides per lesson
const DYNAMIC_SLIDES_STORE: Record<string, TeachingSlide[]> = {};

function formatGeneratedSlideDeck(topic: string, slidesData: any[]): TeachingSlide[] {
  if (!slidesData || slidesData.length === 0) {
    return NEWTON_LESSON_SLIDES;
  }

  return slidesData.map((s: any, idx: number) => {
    const slideNumber = s.slide_number || idx + 1;
    const duration = s.duration_seconds || 15;
    const title = s.title || `Concept ${slideNumber}: ${topic}`;
    const script = s.teacher_script || `In this section, we examine the fundamental mechanics of ${topic}.`;
    const formulas = Array.isArray(s.latex_formulas) ? s.latex_formulas : [];
    
    // Split script into 2-3 transcript segments
    const words = script.split(' ');
    const midPoint = Math.floor(words.length / 2);
    const part1 = words.slice(0, midPoint).join(' ');
    const part2 = words.slice(midPoint).join(' ');

    return {
      id: `dyn_slide_${slideNumber}_${idx}`,
      slideNumber,
      title,
      subtitle: `Masterclass on ${topic}`,
      audioDuration: duration,
      tutorMood: idx === 0 ? 'explaining' : idx === slidesData.length - 1 ? 'celebrating' : 'thoughtful',
      elements: [
        {
          id: `h-${slideNumber}`,
          componentType: 'heading',
          position: { x: 6, y: 10 },
          dimensions: { width: 56, height: 10 },
          animationDelay: 0.2,
          animationType: 'fade-in',
          title: 'Core Topic',
          content: title
        },
        {
          id: `def-${slideNumber}`,
          componentType: 'definition',
          position: { x: 6, y: 24 },
          dimensions: { width: 54, height: 32 },
          animationDelay: 1.5,
          animationType: 'slide-up',
          title: 'Deep Intuition & Mechanics',
          content: script,
          highlightWords: [topic.split(' ')[0], 'principle', 'equilibrium', 'fundamental', 'dynamics']
        },
        {
          id: `note-${slideNumber}`,
          componentType: 'note-box',
          position: { x: 63, y: 12 },
          dimensions: { width: 31, height: 74 },
          animationDelay: 3.5,
          animationType: 'fade-in',
          title: 'Classroom Objectives & Notes',
          content: formulas.length > 0
            ? `• Governing Formulation:\n  ${formulas[0]}\n\n• Key Property:\n  Systematic verification across boundary conditions.\n\n• Interactive Tip:\n  Interrupt anytime with doubts.`
            : `1. Understand fundamental concepts\n2. Analyze core system behaviors\n3. Calculate dynamic responses\n4. Formulate governing relationships.`
        },
        formulas.length > 0
          ? {
              id: `form-${slideNumber}`,
              componentType: 'formula',
              position: { x: 6, y: 60 },
              dimensions: { width: 54, height: 26 },
              animationDelay: 5.5,
              animationType: 'glow-pulse',
              title: 'Governing Mathematical Model',
              content: formulas[0]
            }
          : {
              id: `expl-${slideNumber}`,
              componentType: 'explanation',
              position: { x: 6, y: 60 },
              dimensions: { width: 54, height: 26 },
              animationDelay: 5.5,
              animationType: 'glow-pulse',
              title: 'Applied Engineering & Context',
              content: `Applied across computational modeling, experimental observation, and theoretical physics to model real-world behavior.`
            }
      ],
      transcript: [
        {
          id: `tr-${slideNumber}-1`,
          startTime: 0,
          endTime: Math.floor(duration / 2),
          speaker: 'tutor',
          text: part1 || script
        },
        {
          id: `tr-${slideNumber}-2`,
          startTime: Math.floor(duration / 2) + 0.1,
          endTime: duration,
          speaker: 'tutor',
          text: part2 || `Let's reflect on this principle before proceeding to the next derivation.`
        }
      ]
    };
  });
}

class LessonService {
  private lessons: LessonHistoryItem[] = [...MOCK_LESSONS];

  async getLessons(): Promise<LessonHistoryItem[]> {
    try {
      const res = await fetch('/api/lessons');
      if (res.ok) {
        const dbLessons = await res.json();
        if (Array.isArray(dbLessons) && dbLessons.length > 0) {
          const mapped: LessonHistoryItem[] = dbLessons.map((l: any, idx: number) => ({
            id: String(l.id),
            title: l.title || 'Untitled Lesson',
            subject: 'Physics / Computer Science',
            date: 'Recent',
            durationMinutes: 15,
            progress: 0,
            lastAccessed: 'Active',
            totalSlides: 8,
            completedSlides: 0,
            description: l.description || 'Interactive AI Masterclass',
            thumbnailGradient: idx % 2 === 0
              ? 'from-blue-900/40 via-indigo-900/30 to-slate-950/60'
              : 'from-amber-900/40 via-orange-900/30 to-zinc-950/60'
          }));

          // Merge without duplicates
          const existingIds = new Set(mapped.map((m) => m.id));
          const filteredMocks = this.lessons.filter((m) => !existingIds.has(m.id));
          this.lessons = [...mapped, ...filteredMocks];
        }
      }
    } catch (e) {
      console.warn('Could not fetch from /api/lessons, using local state:', e);
    }
    return [...this.lessons];
  }

  async getLessonById(id: string): Promise<LessonHistoryItem | undefined> {
    const cached = this.lessons.find((l) => l.id === id);
    if (cached) return cached;
    try {
      const res = await fetch(`/api/lessons/${id}`);
      if (res.ok) {
        const data = await res.json();
        return {
          id: String(data.id),
          title: data.title,
          subject: 'Interactive Topic',
          date: 'Today',
          durationMinutes: 15,
          progress: 0,
          lastAccessed: 'Just now',
          totalSlides: data.slides ? data.slides.length : 8,
          completedSlides: 0,
          description: data.description
        };
      }
    } catch (e) {
      console.warn('getLessonById backend error', e);
    }
    return undefined;
  }

  async createLesson(payload: CreateLessonPayload): Promise<LessonHistoryItem> {
    try {
      const res = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        const lessonData = result.lesson;
        const newLesson: LessonHistoryItem = {
          id: String(lessonData.id),
          title: lessonData.title || payload.topic.trim(),
          subject: payload.subject.trim() || 'Physics',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          durationMinutes: payload.durationMinutes || 15,
          progress: 0,
          lastAccessed: 'Just now',
          totalSlides: result.slides_deck?.slides?.length || 8,
          completedSlides: 0,
          description: lessonData.description || `Custom AI lesson on ${payload.topic}`,
          thumbnailGradient: 'from-amber-900/40 via-orange-900/30 to-zinc-950/60'
        };

        if (result.slides_deck?.slides) {
          DYNAMIC_SLIDES_STORE[newLesson.id] = formatGeneratedSlideDeck(
            payload.topic,
            result.slides_deck.slides
          );
        }

        this.lessons = [newLesson, ...this.lessons];
        return newLesson;
      }
    } catch (e) {
      console.warn('Error calling /api/lessons/generate, using fallback generation:', e);
    }

    // Fallback generation
    const newLesson: LessonHistoryItem = {
      id: `les_${Date.now()}`,
      title: payload.topic.trim(),
      subject: payload.subject.trim() || 'Physics',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      durationMinutes: payload.durationMinutes || 15,
      progress: 0,
      lastAccessed: 'Just now',
      totalSlides: 8,
      completedSlides: 0,
      description: `Custom AI lesson on ${payload.topic} for ${payload.level} level in a ${payload.teachingStyle} teaching style.`,
      thumbnailGradient: 'from-amber-900/40 via-orange-900/30 to-zinc-950/60'
    };

    this.lessons = [newLesson, ...this.lessons];
    return newLesson;
  }

  async getTeachingSlidesForLesson(lessonId: string): Promise<TeachingSlide[]> {
    if (DYNAMIC_SLIDES_STORE[lessonId]) {
      return DYNAMIC_SLIDES_STORE[lessonId];
    }

    // Try fetching from backend /api/classroom/slides/generate if custom lesson
    const matchedLesson = this.lessons.find((l) => l.id === lessonId);
    if (matchedLesson && !lessonId.includes('newton') && !lessonId.includes('les_ai_02') && !lessonId.includes('les_bio_03')) {
      try {
        const res = await fetch(`/api/classroom/slides/generate?topic=${encodeURIComponent(matchedLesson.title)}`);
        if (res.ok) {
          const slidesData = await res.json();
          if (slidesData && slidesData.slides) {
            const formatted = formatGeneratedSlideDeck(matchedLesson.title, slidesData.slides);
            DYNAMIC_SLIDES_STORE[lessonId] = formatted;
            return formatted;
          }
        }
      } catch (e) {
        console.warn('Could not generate classroom slides from backend, falling back:', e);
      }
    }

    return NEWTON_LESSON_SLIDES;
  }
}

export const lessonService = new LessonService();

