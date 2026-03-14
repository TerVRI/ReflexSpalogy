export interface BodySystem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  glowColor: string;
  icon: string;
  description: string;
  overview: string;
  keyFunctions: string[];
  keyChemicals: string[];
  reflexologyNote: string;
  meshIds: string[];
}

export const BODY_SYSTEMS: BodySystem[] = [
  {
    id: "skeletal",
    name: "Skeletal System",
    shortName: "Skeletal",
    color: "#E8D5B7",
    glowColor: "#F5E6CC",
    icon: "🦴",
    description: "The body's rigid framework — 206 bones providing structure, protection and movement.",
    overview:
      "The skeletal system is the body's scaffolding. It gives us shape, protects vital organs, anchors muscles, and is the factory where blood cells are born. Bones are living tissue — constantly broken down and rebuilt throughout life.",
    keyFunctions: [
      "Structural support and shape",
      "Protection of organs (skull → brain, ribcage → heart/lungs)",
      "Attachment points for muscles",
      "Red blood cell production (bone marrow)",
      "Mineral storage — calcium and phosphorus",
      "Fat storage in yellow marrow",
    ],
    keyChemicals: ["Calcium (Ca²⁺)", "Phosphorus", "Collagen", "Osteocalcin", "Parathyroid hormone (PTH)", "Calcitonin", "Vitamin D"],
    reflexologyNote:
      "In reflexology, the spine reflex runs along the medial edge of both feet. Skeletal imbalances, especially spinal tension, are key areas of focus for practitioners.",
    meshIds: ["skeleton", "skull", "spine", "ribs", "pelvis", "femur", "tibia", "humerus", "radius", "ulna"],
  },
  {
    id: "muscular",
    name: "Muscular System",
    shortName: "Muscular",
    color: "#E74C3C",
    glowColor: "#FF6B5B",
    icon: "💪",
    description: "Over 600 muscles powering every movement — from a heartbeat to a sprint.",
    overview:
      "Muscles are the body's engines. Skeletal muscles move bones under conscious control; smooth muscles work automatically in organs; cardiac muscle keeps the heart beating. All muscle contraction relies on ATP — the body's energy currency.",
    keyFunctions: [
      "Voluntary movement (skeletal muscle)",
      "Involuntary organ function (smooth muscle)",
      "Heart pumping (cardiac muscle)",
      "Heat generation — muscles produce ~85% of body heat",
      "Posture and stabilisation",
      "Moving substances through vessels and organs",
    ],
    keyChemicals: ["ATP (adenosine triphosphate)", "Actin & Myosin", "Calcium ions (Ca²⁺)", "Creatine phosphate", "Lactic acid", "Troponin", "Tropomyosin"],
    reflexologyNote:
      "Muscular reflex points map across the entire foot sole. Tight or tender areas often correspond to muscular tension in related body zones. Deep pressure can help release accumulated lactic acid.",
    meshIds: ["muscle_deltoid", "muscle_bicep", "muscle_tricep", "muscle_quadricep", "muscle_hamstring", "muscle_gastrocnemius", "muscle_pectoralis", "muscle_trapezius"],
  },
  {
    id: "neuromuscular",
    name: "Neuromuscular System",
    shortName: "Nervous",
    color: "#F39C12",
    glowColor: "#FFB830",
    icon: "⚡",
    description: "The body's electrical wiring — brain, spinal cord and 100 billion neurons firing at speed.",
    overview:
      "The nervous system is the master controller. The brain and spinal cord (CNS) process information; peripheral nerves carry signals to muscles and organs. Neurons communicate via electrical impulses and chemical messengers called neurotransmitters.",
    keyFunctions: [
      "Sensory input — detecting environment changes",
      "Integration — processing signals in brain/spinal cord",
      "Motor output — commanding muscles and glands",
      "Reflexes — rapid automatic responses",
      "Higher functions — thought, memory, emotion",
      "Autonomic regulation — heart rate, digestion, breathing",
    ],
    keyChemicals: ["Acetylcholine (ACh)", "Dopamine", "Serotonin", "Norepinephrine", "GABA", "Glutamate", "Substance P", "Endorphins"],
    reflexologyNote:
      "The 7,200 nerve endings in each foot make reflexology inherently a neurological modality. Stimulation sends signals via the peripheral nervous system to corresponding CNS pathways.",
    meshIds: ["brain", "spinal_cord", "nerve_brachial", "nerve_sciatic", "nerve_radial", "nerve_ulnar", "nerve_median"],
  },
  {
    id: "endocrine",
    name: "Endocrine System",
    shortName: "Endocrine",
    color: "#9B59B6",
    glowColor: "#BD7FDE",
    icon: "🔮",
    description: "The body's chemical messengers — glands that release hormones to regulate everything.",
    overview:
      "The endocrine system communicates through hormones — chemical messengers released into the bloodstream. Unlike the nervous system (fast, electrical), endocrine signals are slower but longer-lasting, regulating growth, metabolism, mood, reproduction, and stress response.",
    keyFunctions: [
      "Metabolism regulation (thyroid)",
      "Blood sugar control (pancreas)",
      "Stress response (adrenals)",
      "Growth and development (pituitary)",
      "Reproductive cycle (gonads)",
      "Calcium balance (parathyroid)",
      "Sleep-wake cycles (pineal)",
    ],
    keyChemicals: ["Insulin", "Glucagon", "Cortisol", "Adrenaline (Epinephrine)", "Thyroxine (T4/T3)", "Growth hormone (GH)", "Melatonin", "Oxytocin", "Testosterone", "Oestrogen"],
    reflexologyNote:
      "Endocrine reflex points are among the most targeted in reflexology. The pituitary reflex is at the big toe centre; thyroid at the big toe base; adrenals at the arch. Balancing these points is central to reflexology treatment.",
    meshIds: ["pituitary", "thyroid", "adrenal", "pancreas", "pineal"],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular System",
    shortName: "Cardiovascular",
    color: "#C0392B",
    glowColor: "#E74C3C",
    icon: "❤️",
    description: "The pump and pipeline — heart, blood vessels and 5 litres of blood in constant motion.",
    overview:
      "The cardiovascular system is a closed-loop transport network. The heart beats ~100,000 times a day, pumping blood through 96,000km of vessels. Blood carries oxygen, nutrients, hormones, and waste products — connecting every cell in the body.",
    keyFunctions: [
      "Oxygen and CO₂ transport",
      "Nutrient delivery to cells",
      "Hormone distribution",
      "Waste removal to kidneys and liver",
      "Immune cell circulation",
      "Temperature regulation",
      "Wound healing (clotting factors)",
    ],
    keyChemicals: ["Haemoglobin", "Nitric oxide (NO)", "Epinephrine", "Angiotensin II", "Aldosterone", "Atrial natriuretic peptide (ANP)", "Prostacyclin", "Thromboxane"],
    reflexologyNote:
      "The heart reflex is on the left foot, below the 4th toe. The heart reflex zone is one of the most delicate — practitioners apply light to medium pressure only. The entire circulatory network has corresponding reflex points across both feet.",
    meshIds: ["heart", "aorta", "vena_cava", "pulmonary_artery", "pulmonary_vein"],
  },
  {
    id: "lymphatic",
    name: "Lymphatic System",
    shortName: "Lymphatic",
    color: "#27AE60",
    glowColor: "#2ECC71",
    icon: "🌿",
    description: "The body's drainage and defence network — lymph nodes, vessels and immune cells.",
    overview:
      "The lymphatic system runs alongside the cardiovascular system but has no pump — it relies on muscle movement and breathing. It collects excess fluid from tissues, filters out pathogens, and returns clean fluid to the bloodstream. It is the highway of the immune system.",
    keyFunctions: [
      "Excess tissue fluid drainage",
      "Immune cell (lymphocyte) transport",
      "Pathogen filtering in lymph nodes",
      "Fat absorption from the digestive tract (chyle)",
      "Tumour surveillance",
      "Inflammation response",
    ],
    keyChemicals: ["Lymph fluid", "Lymphocytes (T-cells, B-cells)", "NK cells", "Immunoglobulins (antibodies)", "Cytokines", "Interleukins", "Interferon"],
    reflexologyNote:
      "Lymphatic reflex points are found in the webs between toes (groin lymph nodes), along the ankle (pelvic lymph), and along the dorsum of the foot (thoracic duct). Reflexology is believed to promote lymphatic drainage and immune function.",
    meshIds: ["lymph_nodes", "spleen", "thymus", "tonsils", "lymph_vessels"],
  },
  {
    id: "respiratory",
    name: "Respiratory System",
    shortName: "Respiratory",
    color: "#2980B9",
    glowColor: "#3498DB",
    icon: "🫁",
    description: "Every breath in and out — lungs, airways and the gas exchange that keeps cells alive.",
    overview:
      "The respiratory system brings oxygen from the air into the blood and expels carbon dioxide. In the alveoli — tiny air sacs in the lungs — oxygen diffuses into capillaries and CO₂ diffuses out. Adults take ~20,000 breaths per day.",
    keyFunctions: [
      "Oxygen intake (inspiration)",
      "Carbon dioxide removal (expiration)",
      "Gas exchange at alveoli",
      "pH regulation (blood acidity via CO₂ levels)",
      "Vocalization and speech",
      "Olfaction (sense of smell, nasal passages)",
      "Immune filtering (nasal hair, mucus)",
    ],
    keyChemicals: ["Oxygen (O₂)", "Carbon dioxide (CO₂)", "Haemoglobin", "Bicarbonate (HCO₃⁻)", "Surfactant", "Nitric oxide (NO)", "Histamine"],
    reflexologyNote:
      "Lung reflexes span the balls of both feet (zones 1-5). The right lung reflex is larger on the right foot; left lung on the left foot. The diaphragm reflex runs across both feet at the waist line — a key pressure point for respiratory conditions.",
    meshIds: ["lungs", "trachea", "bronchi", "diaphragm", "nasal_cavity"],
  },
  {
    id: "digestive",
    name: "Digestive System",
    shortName: "Digestive",
    color: "#E67E22",
    glowColor: "#F39C12",
    icon: "🍎",
    description: "The food processing plant — breaking down nutrients and absorbing them into the bloodstream.",
    overview:
      "The digestive system is a 9-metre tube from mouth to anus, aided by accessory organs (liver, pancreas, gallbladder). Food is broken down mechanically and chemically into molecules small enough to absorb. The gut also houses 70% of the immune system and produces many neurotransmitters.",
    keyFunctions: [
      "Mechanical digestion (chewing, churning)",
      "Chemical digestion (enzymes, acids)",
      "Nutrient absorption (small intestine)",
      "Water reabsorption (large intestine)",
      "Waste elimination",
      "Gut-brain axis signalling",
      "Hormone production (GI hormones)",
    ],
    keyChemicals: ["Hydrochloric acid (HCl)", "Pepsin", "Amylase", "Lipase", "Bile", "Insulin", "Glucagon", "Serotonin (90% made in gut)", "Ghrelin", "Leptin"],
    reflexologyNote:
      "Digestive reflex points occupy the majority of the foot sole — the stomach reflex sits under the big toe, small intestine across the arch, large intestine around the heel. Reflexology for digestion is one of the most researched applications.",
    meshIds: ["stomach", "small_intestine", "large_intestine", "liver", "pancreas", "gallbladder", "oesophagus"],
  },
  {
    id: "urinary",
    name: "Urinary System",
    shortName: "Urinary",
    color: "#F1C40F",
    glowColor: "#F4D03F",
    icon: "💧",
    description: "The body's filtration system — kidneys processing 200 litres of blood daily.",
    overview:
      "The urinary system filters blood through the kidneys — two bean-shaped organs that remove waste, excess water, and regulate blood chemistry. Each kidney contains ~1 million nephrons (filtering units). The average adult produces 1.5 litres of urine per day.",
    keyFunctions: [
      "Blood filtration and waste removal",
      "Blood pressure regulation (renin)",
      "Blood pH balance",
      "Electrolyte balance (Na⁺, K⁺, Cl⁻)",
      "Fluid volume regulation",
      "Erythropoietin production (stimulates red blood cells)",
      "Vitamin D activation",
    ],
    keyChemicals: ["Renin", "Aldosterone", "ADH (vasopressin)", "Erythropoietin (EPO)", "Angiotensin", "Creatinine", "Urea", "Uric acid"],
    reflexologyNote:
      "The kidney reflexes are in the middle of each foot, slightly medial. The bladder reflex is at the medial heel. The ureter reflexes run diagonally from kidney to bladder across the arch. These are important points for fluid balance and detoxification.",
    meshIds: ["kidneys", "ureters", "bladder", "urethra"],
  },
  {
    id: "reproductive",
    name: "Reproductive System",
    shortName: "Reproductive",
    color: "#E91E8C",
    glowColor: "#FF4DB8",
    icon: "🌸",
    description: "The system of life creation — gonads, hormones and the biology of reproduction.",
    overview:
      "The reproductive system exists for one primary purpose: creating new life. But its hormones — oestrogen, progesterone, testosterone — have far-reaching effects on mood, bone density, muscle mass, cardiovascular health, skin, and cognition, making this system relevant far beyond reproduction.",
    keyFunctions: [
      "Gamete production (sperm / eggs)",
      "Hormone regulation (sex hormones)",
      "Fertilisation and implantation",
      "Pregnancy and foetal development",
      "Secondary sex characteristics (puberty)",
      "Libido and sexual function",
      "Bone density maintenance (oestrogen)",
    ],
    keyChemicals: ["Oestrogen", "Progesterone", "Testosterone", "FSH (follicle-stimulating hormone)", "LH (luteinising hormone)", "Oxytocin", "Prolactin", "hCG", "Inhibin"],
    reflexologyNote:
      "Reproductive reflex points are around the ankles — ovaries/testes on the lateral ankle, uterus/prostate on the medial ankle. The fallopian tube/vas deferens reflex runs across the top of the foot. These are commonly worked for hormonal balance.",
    meshIds: ["uterus", "ovaries", "fallopian_tubes", "testes", "prostate"],
  },
];

export const SYSTEM_MAP = Object.fromEntries(BODY_SYSTEMS.map((s) => [s.id, s]));
