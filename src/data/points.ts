export interface ReflexPoint {
  id: string;
  name: string;
  systemIds: string[];
  position2D: { x: number; y: number }; // percentage on SVG body
  footPosition?: { foot: "left" | "right" | "both"; x: number; y: number };
  biology: {
    role: string;
    chemicals?: string[];
    hormones?: string[];
    detail: string;
  };
  audioScript: string;
}

export const REFLEX_POINTS: ReflexPoint[] = [
  // --- SKELETAL ---
  {
    id: "skull",
    name: "Skull",
    systemIds: ["skeletal"],
    position2D: { x: 50, y: 4 },
    biology: {
      role: "Protective casing for the brain; 22 fused bones",
      chemicals: ["Calcium", "Phosphorus", "Collagen"],
      detail:
        "The skull is made of 22 bones — 8 cranial bones protect the brain, 14 facial bones form facial structure. The bones are connected by immovable joints called sutures. Bone matrix is reinforced with calcium hydroxyapatite crystals.",
    },
    audioScript:
      "The skull is made of 22 bones fused together by sutures. Eight cranial bones form a protective vault around the brain, while fourteen facial bones create the features of the face. The skull is rich in calcium phosphate crystals, making it one of the hardest structures in the body.",
  },
  {
    id: "spine",
    name: "Vertebral Column",
    systemIds: ["skeletal"],
    position2D: { x: 50, y: 45 },
    biology: {
      role: "33 vertebrae protecting the spinal cord; shock absorption and movement",
      chemicals: ["Calcium", "Collagen", "Nucleus pulposus (water-rich gel)"],
      detail:
        "The spine has 33 vertebrae: 7 cervical, 12 thoracic, 5 lumbar, 5 sacral (fused), 4 coccygeal (fused). Intervertebral discs act as shock absorbers. The S-curve shape distributes mechanical load and enables upright posture.",
    },
    audioScript:
      "The vertebral column contains 33 vertebrae stacked like building blocks. Between each vertebra sit intervertebral discs — gel-filled cushions that absorb shock. The spine's natural S-curve distributes your body weight efficiently and allows an incredible range of movement.",
  },

  // --- MUSCULAR ---
  {
    id: "bicep",
    name: "Biceps Brachii",
    systemIds: ["muscular"],
    position2D: { x: 22, y: 40 },
    biology: {
      role: "Elbow flexion and forearm supination; classic mirror muscle",
      chemicals: ["ATP", "Actin", "Myosin", "Calcium ions"],
      detail:
        "The biceps has two heads — long and short — both attaching to the radius. Muscle contraction occurs via the sliding filament theory: myosin heads pull actin filaments together, shortening the sarcomere. ATP provides the energy; calcium ions trigger the process.",
    },
    audioScript:
      "The biceps brachii has two muscle heads that merge and attach to the radius bone. When you flex your elbow, myosin filaments grab onto actin filaments and pull them inward, shortening the muscle. This process requires calcium ions as a trigger and ATP as fuel.",
  },
  {
    id: "quadriceps",
    name: "Quadriceps Group",
    systemIds: ["muscular"],
    position2D: { x: 42, y: 70 },
    biology: {
      role: "Knee extension; largest muscle group; key for walking, jumping, climbing",
      chemicals: ["ATP", "Lactic acid", "Creatine phosphate", "Glycogen"],
      detail:
        "The quadriceps are four muscles (rectus femoris, vastus lateralis, vastus medialis, vastus intermedius) that converge into the quadriceps tendon. During intense exercise, anaerobic respiration produces lactic acid when oxygen demand exceeds supply.",
    },
    audioScript:
      "The quadriceps group is actually four separate muscles working together to extend your knee. These are the largest muscles in the body and are critical for all lower limb movement. During hard exercise, when oxygen runs out, the quads switch to anaerobic respiration, producing lactic acid — that burning sensation you feel.",
  },

  // --- NEUROMUSCULAR ---
  {
    id: "brain",
    name: "Brain",
    systemIds: ["neuromuscular"],
    position2D: { x: 50, y: 5 },
    biology: {
      role: "Central processor — 100 billion neurons; cognition, emotion, motor control",
      chemicals: ["Dopamine", "Serotonin", "Acetylcholine", "GABA", "Glutamate", "Norepinephrine"],
      detail:
        "The brain weighs ~1.4kg and consumes 20% of the body's energy. It has four lobes: frontal (decision making), parietal (sensation), temporal (memory, hearing), occipital (vision). The limbic system governs emotion. The cerebellum coordinates movement.",
    },
    audioScript:
      "The brain contains approximately 100 billion neurons, each connected to thousands of others in a web of staggering complexity. It consumes 20% of your total energy despite being only 2% of your body weight. Different regions specialise in different functions: the frontal lobe for decisions, the temporal lobe for memory, the occipital lobe for vision.",
  },
  {
    id: "sciatic_nerve",
    name: "Sciatic Nerve",
    systemIds: ["neuromuscular"],
    position2D: { x: 58, y: 72 },
    biology: {
      role: "Longest nerve in the body; innervates entire lower limb",
      chemicals: ["Acetylcholine", "Substance P", "Glutamate"],
      detail:
        "The sciatic nerve is formed from spinal nerve roots L4–S3. It exits the pelvis through the greater sciatic foramen, travels down the posterior thigh, and branches at the knee into tibial and common peroneal nerves. Compression causes 'sciatica' — shooting pain down the leg.",
    },
    audioScript:
      "The sciatic nerve is the thickest and longest nerve in the human body, roughly the width of your thumb. It originates from five spinal nerve roots in the lower back, travels through the buttock, down the back of the thigh, and branches all the way to the foot. Sciatic compression sends sharp pain shooting down the entire leg.",
  },

  // --- ENDOCRINE ---
  {
    id: "pituitary",
    name: "Pituitary Gland",
    systemIds: ["endocrine"],
    position2D: { x: 50, y: 9 },
    biology: {
      role: "Master gland — controls all other endocrine glands via hormones",
      hormones: ["GH (growth hormone)", "TSH", "ACTH", "FSH", "LH", "ADH", "Oxytocin", "Prolactin"],
      detail:
        "The pituitary is pea-sized but controls thyroid, adrenals, gonads, and growth. The anterior pituitary produces GH, TSH, ACTH, FSH, LH, prolactin. The posterior stores and releases ADH and oxytocin from the hypothalamus. It operates via negative feedback loops.",
    },
    audioScript:
      "The pituitary gland is the size of a pea, yet it is the master controller of the entire endocrine system. Sitting at the base of the brain, it receives signals from the hypothalamus and sends out hormones that command every other endocrine gland. Growth hormone, thyroid stimulating hormone, stress hormones, reproductive hormones — all originate here.",
  },
  {
    id: "adrenal_glands",
    name: "Adrenal Glands",
    systemIds: ["endocrine"],
    position2D: { x: 50, y: 52 },
    biology: {
      role: "Stress hormones, fight-or-flight, electrolyte balance",
      hormones: ["Cortisol", "Adrenaline (Epinephrine)", "Noradrenaline", "Aldosterone", "DHEA"],
      detail:
        "The adrenal glands sit atop each kidney and have two regions. The cortex produces cortisol (stress), aldosterone (blood pressure), and sex hormone precursors. The medulla produces adrenaline and noradrenaline for fight-or-flight responses. Chronic stress leads to cortisol dysregulation.",
    },
    audioScript:
      "The adrenal glands sit like hats on top of each kidney. Their inner core, the medulla, floods the bloodstream with adrenaline in seconds during a threat. The outer cortex produces cortisol — the chronic stress hormone — which regulates energy, inflammation, and metabolism. Modern chronic stress keeps cortisol chronically elevated, disrupting sleep, immunity, and mood.",
  },
  {
    id: "thyroid",
    name: "Thyroid Gland",
    systemIds: ["endocrine"],
    position2D: { x: 50, y: 16 },
    biology: {
      role: "Metabolic rate, heart rate, temperature regulation, growth",
      hormones: ["Thyroxine (T4)", "Triiodothyronine (T3)", "Calcitonin"],
      detail:
        "The thyroid is a butterfly-shaped gland in the neck. T3 and T4 hormones regulate the basal metabolic rate of every cell. Calcitonin lowers blood calcium. Thyroid function is controlled by pituitary TSH via negative feedback. Iodine is essential for hormone synthesis.",
    },
    audioScript:
      "The thyroid is a butterfly-shaped gland wrapped around your windpipe. It produces thyroxine, which sets the metabolic speed of every cell in your body. Too much — hyperthyroidism — and your heart races, you lose weight, and feel anxious. Too little — hypothyroidism — and everything slows down: fatigue, weight gain, depression. Iodine in your diet is essential for thyroid hormone production.",
  },

  // --- CARDIOVASCULAR ---
  {
    id: "heart",
    name: "Heart",
    systemIds: ["cardiovascular"],
    position2D: { x: 46, y: 28 },
    biology: {
      role: "Four-chamber pump; beats 100,000 times per day; drives entire circulatory system",
      chemicals: ["Epinephrine", "Norepinephrine", "Nitric oxide", "ANP (atrial natriuretic peptide)", "Troponin I & T"],
      detail:
        "The heart is a hollow muscular organ divided into four chambers: right atrium, right ventricle (pulmonary circuit), left atrium, left ventricle (systemic circuit). The sinoatrial node acts as the natural pacemaker, generating ~60-100 electrical impulses per minute.",
    },
    audioScript:
      "Your heart beats approximately 100,000 times every day without you ever thinking about it. It has four chambers: the right side receives deoxygenated blood and sends it to the lungs, while the left side receives oxygenated blood and pumps it to the entire body. The sinoatrial node in the right atrium generates the electrical spark that starts each heartbeat.",
  },
  {
    id: "aorta",
    name: "Aorta",
    systemIds: ["cardiovascular"],
    position2D: { x: 50, y: 33 },
    biology: {
      role: "Largest artery; carries oxygenated blood from left ventricle to body",
      chemicals: ["Nitric oxide", "Endothelin", "Prostacyclin", "Angiotensin II"],
      detail:
        "The aorta is ~30cm long and 2.5cm wide, with walls 2mm thick. It arches over the heart (aortic arch) before descending through the chest and abdomen. Branches supply the head (carotid arteries), arms (subclavian), kidneys (renal), and legs (iliac arteries).",
    },
    audioScript:
      "The aorta is your body's main highway — the largest blood vessel, carrying freshly oxygenated blood directly from the heart's left ventricle. It arches up and over, then dives down through your chest and abdomen, sending branches to every major organ and region of the body.",
  },

  // --- LYMPHATIC ---
  {
    id: "lymph_nodes",
    name: "Lymph Nodes",
    systemIds: ["lymphatic"],
    position2D: { x: 38, y: 25 },
    biology: {
      role: "Immune filtration stations; trap pathogens and activate immune response",
      chemicals: ["Lymphocytes", "Antibodies", "Cytokines", "Interleukins"],
      detail:
        "The body has ~600 lymph nodes clustered in the neck, armpits, groin, and abdomen. Each node filters lymph fluid, trapping bacteria, viruses, and cancer cells. B lymphocytes produce antibodies; T lymphocytes directly attack pathogens. Swollen nodes indicate active immune response.",
    },
    audioScript:
      "Lymph nodes are small bean-shaped structures scattered throughout your body, acting as checkpoints for the immune system. Lymph fluid carrying debris and pathogens flows in, gets filtered and inspected by immune cells, and clean fluid flows out. When you have an infection, nearby lymph nodes swell as they ramp up immune activity.",
  },
  {
    id: "spleen",
    name: "Spleen",
    systemIds: ["lymphatic"],
    position2D: { x: 38, y: 42 },
    biology: {
      role: "Blood filter; destroys old red blood cells; immune reservoir",
      chemicals: ["Lymphocytes", "Macrophages", "Iron", "Bilirubin"],
      detail:
        "The spleen filters blood (not lymph), removing old or damaged red blood cells. Its white pulp contains lymphocytes for immune surveillance; red pulp stores blood cells. The spleen can release platelets and red cells during haemorrhage. It recycles iron from destroyed red blood cells.",
    },
    audioScript:
      "The spleen is an often-overlooked organ tucked under the left ribs. It filters your entire blood supply, identifying and destroying aged or damaged red blood cells. It also holds a reserve of platelets and immune cells ready to deploy in an emergency. When a red blood cell is broken down, the iron is carefully recycled for making new ones.",
  },

  // --- RESPIRATORY ---
  {
    id: "lungs",
    name: "Lungs",
    systemIds: ["respiratory"],
    position2D: { x: 50, y: 26 },
    biology: {
      role: "Gas exchange — O₂ in, CO₂ out; 300 million alveoli; total surface area of a tennis court",
      chemicals: ["O₂", "CO₂", "Surfactant", "Bicarbonate", "Haemoglobin"],
      detail:
        "The lungs contain ~300 million alveoli with a total surface area of ~70m² — roughly a tennis court. Oxygen diffuses across the thin alveolar membrane into capillaries; CO₂ diffuses out. Surfactant (produced by type II pneumocytes) reduces surface tension, preventing alveolar collapse.",
    },
    audioScript:
      "Your lungs contain approximately 300 million tiny air sacs called alveoli, with a combined surface area equal to a tennis court. This enormous surface allows rapid gas exchange: oxygen diffuses into the bloodstream while carbon dioxide diffuses out to be exhaled. A substance called surfactant coats the alveoli, preventing them from collapsing between breaths.",
  },
  {
    id: "diaphragm",
    name: "Diaphragm",
    systemIds: ["respiratory", "muscular"],
    position2D: { x: 50, y: 38 },
    biology: {
      role: "Primary breathing muscle; dome-shaped; controlled by phrenic nerve",
      chemicals: ["Acetylcholine", "ATP"],
      detail:
        "The diaphragm is a dome-shaped muscle separating the thorax from the abdomen. When it contracts, it flattens downward, increasing thoracic volume and creating negative pressure that draws air in (inspiration). Relaxation allows elastic recoil to expel air. The phrenic nerve (C3–C5) controls it.",
    },
    audioScript:
      "The diaphragm is your primary breathing muscle — a dome-shaped sheet of muscle separating your chest from your abdomen. When it contracts, it moves downward, creating a vacuum that pulls air into your lungs. Every breath you've ever taken has been powered by the diaphragm. In reflexology, the diaphragm reflex line crosses both feet and is one of the most important zones to work.",
  },

  // --- DIGESTIVE ---
  {
    id: "stomach",
    name: "Stomach",
    systemIds: ["digestive"],
    position2D: { x: 47, y: 43 },
    biology: {
      role: "Acid digestion of proteins; mechanical churning; kills most bacteria",
      chemicals: ["HCl (pH 1.5–3.5)", "Pepsin", "Gastrin", "Mucus", "Intrinsic factor"],
      detail:
        "The stomach secretes hydrochloric acid (pH 1.5–3.5) — acidic enough to dissolve metal. This activates pepsinogen into pepsin for protein digestion and kills most swallowed pathogens. The stomach lining is protected by a mucus layer. Gastrin hormone signals acid production.",
    },
    audioScript:
      "Your stomach secretes hydrochloric acid at a pH between 1.5 and 3.5 — acidic enough to dissolve metal. This acid activates protein-digesting enzymes and kills most bacteria you accidentally swallow. A thick mucus layer protects the stomach wall from its own acid. Food enters as a solid and leaves as a liquid paste called chyme.",
  },
  {
    id: "liver",
    name: "Liver",
    systemIds: ["digestive"],
    position2D: { x: 43, y: 42 },
    biology: {
      role: "500+ functions: detoxification, bile production, protein synthesis, glucose storage",
      chemicals: ["Bile", "Albumin", "Clotting factors", "Glutathione", "Glycogen", "Cholesterol"],
      detail:
        "The liver is the body's chemical factory with over 500 known functions. It detoxifies blood, produces bile for fat digestion, synthesises clotting proteins, converts excess glucose to glycogen, and produces cholesterol. Hepatocytes (liver cells) regenerate remarkably well — the liver can regrow from just 25% of its mass.",
    },
    audioScript:
      "The liver performs over 500 different functions — making it the body's most versatile organ. It filters toxins from the blood, produces bile to digest fats, makes clotting proteins, stores glucose as glycogen, and manufactures cholesterol. Remarkably, the liver can regenerate itself completely from just 25% of its original mass.",
  },

  // --- URINARY ---
  {
    id: "kidneys",
    name: "Kidneys",
    systemIds: ["urinary"],
    position2D: { x: 50, y: 52 },
    biology: {
      role: "Filter 200 litres of blood daily; regulate blood pressure, fluid balance and red blood cell production",
      chemicals: ["Renin", "Erythropoietin (EPO)", "Aldosterone", "ADH", "Urea", "Creatinine"],
      detail:
        "Each kidney contains ~1 million nephrons (filtering units). Together they filter ~200L of blood per day, producing ~1.5L of urine. The kidney regulates blood pressure via the renin-angiotensin-aldosterone system (RAAS). EPO production stimulates red blood cell production in bone marrow.",
    },
    audioScript:
      "Your two kidneys filter your entire blood supply about 40 times every day — processing roughly 200 litres. Each kidney contains about 1 million microscopic filtering units called nephrons. Besides cleaning the blood, kidneys regulate blood pressure by releasing renin, activate vitamin D, and stimulate red blood cell production through erythropoietin.",
  },
  {
    id: "bladder",
    name: "Urinary Bladder",
    systemIds: ["urinary"],
    position2D: { x: 50, y: 63 },
    biology: {
      role: "Urine storage; holds 400–600ml; stretch receptors signal urge to void",
      chemicals: ["Urea", "Uric acid", "Creatinine", "Electrolytes"],
      detail:
        "The bladder is a hollow muscular organ that can expand from 50ml to 600ml. The detrusor muscle in its wall contracts during urination. Stretch receptors signal the brain when ~250ml is reached. The internal and external urethral sphincters control continence.",
    },
    audioScript:
      "The urinary bladder is an elastic bag that can hold between 400 and 600 millilitres of urine. It's lined with specialised cells that can stretch enormously. Stretch receptors in the wall send signals to the brain when it's about a third full, creating the urge to urinate. Two sphincter muscles control when urine is released.",
  },

  // --- REPRODUCTIVE ---
  {
    id: "ovaries",
    name: "Ovaries",
    systemIds: ["reproductive", "endocrine"],
    position2D: { x: 50, y: 64 },
    biology: {
      role: "Egg production and female sex hormone synthesis",
      hormones: ["Oestrogen", "Progesterone", "Inhibin", "Relaxin"],
      detail:
        "Females are born with ~1–2 million follicles (immature eggs), declining to ~300,000 by puberty. The ovaries produce oestrogen (follicular phase) and progesterone (luteal phase). Oestrogen affects bone density, cardiovascular health, mood, skin, and cognition, not just reproduction.",
    },
    audioScript:
      "The ovaries are small but extraordinarily important organs. Present from birth, they contain all the eggs a person will ever have. Beyond reproduction, the hormones they produce — oestrogen and progesterone — affect bone density, heart health, mood, memory, skin health, and metabolism. At menopause, declining oestrogen affects every one of these systems.",
  },
];

export const POINTS_MAP = Object.fromEntries(REFLEX_POINTS.map((p) => [p.id, p]));
