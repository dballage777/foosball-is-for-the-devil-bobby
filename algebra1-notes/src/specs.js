const OUT = "/home/user/foosball-is-for-the-devil-bobby/algebra1-notes/";

module.exports = [
// ================= LESSON 2 =================
{
  out: OUT + "Algebra1_Unit1_Lesson2_Evaluating_Expressions_Order_of_Operations.docx",
  titleLine: "Unit 1 – Lesson 2: Evaluating Expressions & Order of Operations",
  subtitle: "Substitution & the Order of Operations (PEMDAS)",
  running: "Algebra 1  •  Unit 1  •  Lesson 2",
  foot: "Evaluating Expressions & Order of Operations",
  objectives: [
    "evaluate expressions using the correct order of operations.",
    "substitute given numerical values for variables to evaluate algebraic expressions.",
  ],
  applications: [
    { label: "COMPUTER SCIENCE & ENGINEERING", text: "Evaluating expressions is exactly how computers process algorithms. When a programmer writes code for a video game physics engine or a financial application, they write algebraic expressions. The computer then substitutes real-time data (like a player's speed or a stock price) into those variables and follows the order of operations to calculate the exact outcome instantly." },
  ],
  vocab: [
    ["O___________ of O_______________", "The strict rule defining which procedures to perform first in a given mathematical expression (PEMDAS).", "1. P   2. E   3. M/D   4. A/S"],
    ["E_______________", "To find the numerical value of an expression.", "Simplify to a single number."],
    ["S_______________", "To replace a variable with a specific numerical value.", "If x = 3, then 2x becomes 2(3)."],
  ],
  exampleSets: [
    { title: "Example Set A: Standard Order of Operations", work: 2, problems: [
      "1.  14 + (6 + 3)", "2.  9 + 6(3 + 8)", "3.  (3)^4", "4.  54 - 7^2 + (6^2 - 4^2)" ] },
    { title: "Example Set B: Evaluating Algebraic Expressions", work: 2, problems: [
      "5.  Evaluate b - c;  use b = 3 and c = 2", "6.  Evaluate ac;  use a = 5 and c = 12",
      "7.  Evaluate (m + n)^3;  use m = 2 and n = 4", "8.  Evaluate (8 - a)^5;  use a = 5" ] },
    { title: "Example Set C: Advanced Substitution", work: 2, problems: [
      "9.  Evaluate (3d)^2 - f^2;  use d = 4 and f = 12", "10.  Evaluate 3xy ÷ r + 8;  use x = 3, y = 4, and r = 6" ] },
  ],
  commonMistakes: [
    "Adding or subtracting before multiplying or dividing (ignoring PEMDAS).",
    "Squaring a negative number incorrectly (e.g., -3^2 vs (-3)^2).",
    "Forgetting to use parentheses when substituting negative numbers for variables.",
    "Always doing multiplication before division—remember they are left to right!",
  ],
  rules: { headers: ["ORDER", "OPERATION"], rows: [
    ["P - Parentheses", "Simplify everything inside grouping symbols first ( ), [ ], or fraction bars."],
    ["E - Exponents", "Calculate all powers and roots."],
    ["M/D - Multiply / Divide", "Perform all multiplication and division from LEFT to RIGHT."],
    ["A/S - Add / Subtract", "Perform all addition and subtraction from LEFT to RIGHT."],
  ] },
  summary: "To evaluate an algebraic expression, you must first substitute the given numerical values for their corresponding variables. Once substituted, you must strictly follow the Order of Operations (PEMDAS) to simplify the expression down to a single numerical value.",
  keyTakeaways: [
    "Always substitute values using parentheses to avoid sign errors.",
    "Multiplication and Division are on the same level (left to right).",
    "Addition and Subtraction are on the same level (left to right).",
    "A fraction bar acts as a grouping symbol—simplify the top and bottom completely before dividing.",
  ],
},
// ================= LESSON 3 =================
{
  out: OUT + "Algebra1_Unit1_Lesson3_Solving_TwoStep_Equations.docx",
  titleLine: "Unit 1 – Lesson 3: Solving Two-Step Equations",
  subtitle: "Isolating the Variable with Inverse Operations",
  running: "Algebra 1  •  Unit 1  •  Lesson 3",
  foot: "Solving Two-Step Equations",
  objectives: [
    "solve two-step equations using inverse operations.",
    "translate real-world scenarios into two-step equations and solve them.",
  ],
  applications: [
    { label: "BUSINESS & SERVICE FEES", text: "Two-step equations are the blueprint for almost every flat-fee plus hourly-rate business model. Plumbers, mechanics, gym memberships, and rental car companies charge a base fee plus a rate per hour or per item. If you know your total bill, you can write and solve a two-step equation to determine exactly how many hours you were charged for!" },
  ],
  vocab: [
    ["T____-S______ E_______________", "An equation that requires exactly two inverse operations to isolate the variable.", "2x + 5 = 15"],
    ["I____________ O_______________", "Operations that undo each other.", "+ and -,  × and ÷"],
    ["C_______________ (constant)", "A fixed number that is added or subtracted from the variable term.", "In 3x - 7, the -7 is the constant."],
    ["C_______________ (coefficient)", "The number multiplying the variable.", "In 3x - 7, the 3 is the coefficient."],
  ],
  exampleSets: [
    { title: "Example Set A: Solving Basic Two-Step Equations", work: 1, problems: [
      "1.  80 = 8 + 6x", "2.  -9 = -7 + (v / 3)", "3.  -9 + (x / 6) = -8", "4.  7 + 10x = -163" ] },
    { title: "Example Set B: Solving with Decimals and Fractions", work: 1, problems: [
      "5.  -9 = (v / 18) - 10", "6.  11.33 = -2.3 + 4.7k", "7.  5.1x + 0.9 = 29.97", "8.  24 = -(1/2)x + 18" ] },
    { title: "Example Set C: Real-World Applications", work: 1, problems: [
      "9.  Music App: Maria's music streaming app charges $12 for a plan plus $1.50 per download. If her bill was $45 last month, how many songs did Maria download? (Write equation and solve)",
      "10.  Car Rental: You rent a car. You pay 5 days of rent plus a $100 security deposit. The total amount paid is $400. How much was the rental car per day? (Write equation and solve)",
      "11.  Gym Membership: Carol joins a gym. She pays a fee of $50 plus $2 each visit (v). If Carol paid $78, how many times did she visit? (Write equation and solve)" ] },
  ],
  commonMistakes: [
    "Dividing by the coefficient before adding or subtracting the constant.",
    "Forgetting to balance the equation (doing an operation to only one side).",
    "Dropping negative signs when dealing with subtraction (e.g., leaving a negative variable as positive).",
  ],
  rules: { headers: ["STEP", "ACTION"], rows: [
    ["Step 1: Undo Addition/Subtraction", "Move the constant term away from the variable by doing the opposite operation to both sides."],
    ["Step 2: Undo Multiplication/Division", "Isolate the variable by multiplying or dividing by the coefficient on both sides."],
  ] },
  summary: "Solving two-step equations requires working backwards through the order of operations. To isolate the variable, you must first undo any addition or subtraction (the constant), and then undo any multiplication or division (the coefficient). Keeping the equation balanced at every step is essential.",
  keyTakeaways: [
    "Locate the variable first.",
    "Always undo addition or subtraction FIRST.",
    "Always undo multiplication or division SECOND.",
    "Check your work by substituting your answer back into the original equation.",
  ],
},
// ================= LESSON 4 =================
{
  out: OUT + "Algebra1_Unit1_Lesson4_Distributive_Property_Simplifying_Expressions.docx",
  titleLine: "Unit 1 – Lesson 4: Distributive Property & Simplifying Expressions",
  subtitle: "Distributing & Combining Like Terms",
  running: "Algebra 1  •  Unit 1  •  Lesson 4",
  foot: "Distributive Property & Simplifying Expressions",
  objectives: [
    "use the Distributive Property to simplify expressions.",
    "combine like terms to simplify complex algebraic expressions.",
    "write algebraic expressions from verbal descriptions.",
  ],
  applications: [
    { label: "ARCHITECTURE & EVENT PLANNING", text: "The Distributive Property allows you to calculate totals for grouped items quickly. If an event planner is creating 50 identical gift bags, and each bag contains 3 pens and 2 notebooks, they distribute the 50 to both items to find the total inventory needed (50*3 pens + 50*2 notebooks). Combining like terms is simply organizing your inventory so you know exactly what you have!" },
  ],
  vocab: [
    ["D_______________ P______________", "Multiplying a value to an expression inside parentheses.", "a(b + c) = ab + ac"],
    ["L________ T____________", "Terms whose variables and their exponents are exactly the same.", "3x and -5x"],
    ["S_______________ E____________", "An expression where all distribution is done and all like terms are combined.", "2x + 3x becomes 5x"],
  ],
  exampleSets: [
    { title: "Example Set A: The Distributive Property", work: 0, problems: [
      "1.  4(3x + 6)", "2.  2(x + 4)", "3.  -3(2x - 6)", "4.  -5(9x + 8)" ] },
    { title: "Example Set B: Combining Like Terms", work: 0, problems: [
      "5.  5x + 2x + 4x - 7x", "6.  3a + 2b - 2a + 4b", "7.  9a^2 + 4a^2 - 8a^3", "8.  15k^3 + 8m - 7k^3 + 2m" ] },
    { title: "Example Set C: Distribute THEN Combine Like Terms", work: 0, problems: [
      "9.  3(x + 2) + 6x", "10.  -2(4a + 4) - 2", "11.  -1/5(10x + 15) + 2x", "12.  6(3x - 2) + 4x" ] },
    { title: "Example Set D: Application & Translation", work: 1, problems: [
      "13.  Write an expression: “Five times the quantity x plus 2”",
      "14.  Write an expression: “Three times the quantity n minus 4”",
      "15.  Geometry: The sides of a quadrilateral are 3a, a + 2, 2a - 1, and 3a + 6. Write the sum of the lengths (perimeter), and then simplify." ] },
  ],
  commonMistakes: [
    "Distributing to the first term in parentheses but forgetting the second term.",
    "Dropping or mismanaging negative signs when distributing a negative number.",
    "Trying to combine terms that are NOT like terms (e.g., adding 3x + 4 to get 7x).",
  ],
  rules: { headers: ["PROCESS", "HOW IT WORKS"], rows: [
    ["Distributing a Positive", "Multiply the outside number by EVERY term inside. The inside signs stay the same."],
    ["Distributing a Negative", "Multiply the outside number by EVERY term inside. The inside signs FLIP."],
    ["Combining Like Terms", "Add or subtract the coefficients of matching variables. The variable part stays exactly the same."],
  ] },
  summary: "Simplifying algebraic expressions involves two major steps: distributing to remove parentheses and combining like terms to condense the expression. These steps must be performed before you can solve more complex equations.",
  keyTakeaways: [
    "Draw arrows when distributing to ensure you multiply every term inside the parentheses.",
    "When a negative is outside the parentheses, it flips the sign of everything inside.",
    "You can only add or subtract terms with the exact same variable configuration (like terms).",
    "Always take the sign immediately to the left of a term when combining.",
  ],
},
// ================= LESSON 5 =================
{
  out: OUT + "Algebra1_Unit1_Lesson5_Solving_MultiStep_Equations.docx",
  titleLine: "Unit 1 – Lesson 5: Solving Multi-Step Equations",
  subtitle: "Simplify First, Then Solve",
  running: "Algebra 1  •  Unit 1  •  Lesson 5",
  foot: "Solving Multi-Step Equations",
  objectives: [
    "solve multi-step equations by distributing and combining like terms first.",
    "write and solve multi-step equations for complex real-world word problems.",
  ],
  applications: [
    { label: "PAYROLL & BUDGETING", text: "When calculating weekly wages that include different hours worked on different days, flat allowances, and deductions, multi-step equations model the situation. By setting up the equation, combining the hours worked (like terms), and working backwards, you can determine an unknown hourly wage from a final paycheck total." },
  ],
  vocab: [
    ["M____-S______ E_______________", "Equations requiring more than two steps to isolate the variable.", "3(x + 2) - x = 14"],
    ["S_______________", "Condensing an expression by distributing and combining like terms.", "Cleaning up the equation first."],
  ],
  exampleSets: [
    { title: "Example Set A: Simplifying First", work: 2, problems: [
      "1.  1 + 6v + 7v = 27", "2.  8 + 7(6v + 4) = 120", "3.  -4(7 + 5x) - 5 = 47", "4.  -3(x + 5) - 1 = -22" ] },
    { title: "Example Set B: Solving Multi-Step Equations", work: 2, problems: [
      "5.  -7(x + 4) + 2 = -47", "6.  4(3n - 3) - 8 = 16", "7.  3(3 - 7p) - 3p = -63", "8.  9r + 4 = 130" ] },
    { title: "Example Set C: Real-World Applications", work: 3, problems: [
      "9.  Payroll: Tina worked 5 hours on Friday and 7 hours on Saturday. She gets a $15 allowance. She was paid $147 total. How much does she get paid per hour?",
      "10.  Travel: A family buys airline tickets. Each ticket is $150. Insurance is $20 per ticket. There is a flat $30 website fee. Total charge is $880. How many tickets did they buy?" ] },
  ],
  commonMistakes: [
    "Starting to undo addition/subtraction before fully simplifying both sides of the equation.",
    "Moving variables to the other side using inverse operations when they are already on the SAME side (they just need to be combined).",
    "Distribution errors (especially missing the negative sign on the second term).",
  ],
  rules: { headers: ["MULTI-STEP EQUATION STEPS", "ACTION REQUIRED"], rows: [
    ["Step 1: Distribute", "If there are parentheses, use the distributive property to remove them."],
    ["Step 2: Combine Like Terms", "Clean up each side of the equals sign independently. Put variables together and constants together."],
    ["Step 3: Undo Add/Sub", "Use inverse operations to move constants away from the variable."],
    ["Step 4: Undo Mult/Div", "Use inverse operations to remove the coefficient and isolate the variable."],
  ] },
  summary: "To solve multi-step equations, you must first simplify the equation as much as possible. This means distributing to remove parentheses and combining any like terms on the same side of the equals sign. Once the equation is fully simplified, it becomes a standard two-step equation that you can solve using inverse operations.",
  keyTakeaways: [
    "Do not cross the equals sign until each individual side is fully simplified!",
    "Combine terms on the same side using their normal signs; move terms across the equals sign using opposite signs.",
    "Follow the strict 4-step process: Distribute -> Combine -> Undo Add/Sub -> Undo Mult/Div.",
  ],
},
// ================= LESSON 6 =================
{
  out: OUT + "Algebra1_Unit1_Lesson6_Equations_with_Variables_on_Both_Sides.docx",
  titleLine: "Unit 1 – Lesson 6: Equations with Variables on Both Sides",
  subtitle: "Collecting Variables & Interpreting Solutions",
  running: "Algebra 1  •  Unit 1  •  Lesson 6",
  foot: "Equations with Variables on Both Sides",
  objectives: [
    "solve equations that contain variable terms on both sides of the equals sign.",
    "identify when an equation has one solution, no solution, or infinitely many solutions.",
    "write and solve equations modeling break-even points in real-world scenarios.",
  ],
  applications: [
    { label: "BREAK-EVEN ANALYSIS", text: "Businesses use equations with variables on both sides to find their “break-even point” or to compare two different pricing models to find out when they cost exactly the same. For example, comparing a streaming service with a high monthly fee and no rental costs versus a free service that charges per movie rental." },
  ],
  vocab: [
    ["V_______ on B_______ S_______", "When the unknown value appears on both the left and right of the equals sign.", "5x + 2 = 3x - 8"],
    ["N___ S_______________", "An equation that is false for any value of the variable.", "x = x + 1 (yields 0 = 1)"],
    ["I____________ (Infinitely Many)", "An equation that is true for all values of the variable.", "2x = 2x (yields 0 = 0)"],
  ],
  exampleSets: [
    { title: "Example Set A: Moving Variables", work: 2, problems: [
      "1.  7x = 3x - 24", "2.  5x + 2 = 3x + 10", "3.  2m - 4 = 5m + 11", "4.  -6y + 14 = -2y - 10" ] },
    { title: "Example Set B: Distributing and Variables on Both Sides", work: 2, problems: [
      "5.  2(x - 4) = 4x - 12", "6.  3(2x + 5) = 6x + 15", "7.  4(k - 3) = 2(2k - 6)", "8.  -(w + 4) = 3w - 12" ] },
    { title: "Example Set C: Applications and Word Problems", work: 3, problems: [
      "9.  Translation: “If 6 is subtracted from twice a number, the result is 4 less than the number.” Find the number.",
      "10.  Break-Even: Jon has already planted 60 flowers plus 44 per hour. Sara has planted 96 flowers plus 32 per hour. In how many hours will they have planted the same amount of flowers?" ] },
  ],
  commonMistakes: [
    "Trying to combine variables that are on opposite sides of the equals sign without using inverse operations.",
    "Subtracting a variable from one side, but writing it as a constant on the other (e.g. subtracting 2x, but writing -2 on the other side).",
    "Stopping when the variables cancel out and not correctly interpreting whether it is No Solution or Infinitely Many Solutions.",
  ],
  rules: { headers: ["STEP TO SOLVE", "DESCRIPTION"], rows: [
    ["Step 1: Simplify Both Sides", "Distribute and combine like terms on the left side. Do the same on the right side."],
    ["Step 2: Move the Variable", "Use inverse operations (+ or -) to collect all variable terms on one side of the equals sign (usually the side with the larger coefficient)."],
    ["Step 3: Solve", "Solve the remaining two-step equation."],
  ] },
  summary: "When an equation has variables on both sides, your primary goal is to gather all the variable terms onto one side of the equation using addition or subtraction. Once the variables are collected on a single side, you can proceed to isolate the variable using standard solving techniques.",
  keyTakeaways: [
    "It is usually easier to move the smaller variable term to the side with the larger variable term to avoid negative coefficients.",
    "If all variables cancel out and leave a FALSE statement (e.g., 4 = 7), the answer is NO SOLUTION.",
    "If all variables cancel out and leave a TRUE statement (e.g., 5 = 5), the answer is INFINITELY MANY SOLUTIONS (Identity).",
  ],
},
];
