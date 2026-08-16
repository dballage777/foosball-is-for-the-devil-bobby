// Apologetics taxonomy + original educational prose.
// Slugs here MUST match the seed in supabase/migrations/0005 so that
// bible_apologetics_links anchors resolve. Prose is original summary writing
// (not copied from copyrighted works) and is intentionally careful not to
// overstate scholarly consensus or manuscript statistics.

export interface Topic {
  slug: string;
  title: string;
  summary: string;
}

export interface Category {
  slug: string;
  title: string;
  summary: string;
  topics: Topic[];
}

export const APOLOGETICS_FOUNDATION = {
  whatIsIt:
    "Apologetics is the practice of giving thoughtful reasons for the Christian hope. The word comes from the Greek apologia — a reasoned defense. It is not about winning arguments but about answering honest questions with honesty, clarity, and respect.",
  whyItMatters:
    "People have real questions about God, suffering, science, and history. Apologetics serves love of neighbor by taking those questions seriously, and it strengthens believers who want to understand what they believe and why. Faith and reason are not enemies; careful thinking is part of loving God with the mind.",
  keyVerse: {
    reference: "1 Peter 3:15",
    bookSlug: "1-peter",
    chapter: 3, // 1 Peter 3:15
    idea: 'Believers are called to "always be prepared to give an answer" for the hope they have — and to do so "with gentleness and respect."',
  },
  postures: [
    "Answer honest questions honestly.",
    "Represent other views fairly — never a straw man.",
    "Distinguish what is certain from what is disputed.",
    "Hold conclusions with intellectual humility.",
    "Keep gentleness and respect central (1 Peter 3:15–16).",
  ],
};

export const CATEGORIES: Category[] = [
  {
    slug: "does-god-exist",
    title: "Does God Exist?",
    summary:
      "Classic arguments that the existence of God is a reasonable inference from the world we observe.",
    topics: [
      { slug: "cosmological-argument", title: "The Cosmological Argument", summary: "If the universe began to exist, it is reasonable to ask what caused it to begin." },
      { slug: "contingency-argument", title: "The Argument from Contingency", summary: "Why there is something rather than nothing, and whether a necessary being best explains it." },
      { slug: "design-argument", title: "The Design Argument", summary: "Whether apparent design in nature is better explained by intention than by chance alone." },
      { slug: "moral-argument", title: "The Moral Argument", summary: "If objective moral values and duties exist, what best grounds them?" },
    ],
  },
  {
    slug: "origin-of-the-universe",
    title: "Origin of the Universe",
    summary: "Why the universe began and why anything exists at all.",
    topics: [
      { slug: "universe-had-a-beginning", title: "Did the Universe Begin?", summary: "Cosmological and philosophical reasons often given for a beginning of space, time, and matter." },
      { slug: "cause-of-the-universe", title: "What Caused the Universe?", summary: "Candidate explanations — necessity, chance, or a transcendent cause — and how they are assessed." },
    ],
  },
  {
    slug: "fine-tuning",
    title: "Fine-Tuning",
    summary: "The life-permitting balance of physical constants and initial conditions.",
    topics: [
      { slug: "physical-constants", title: "Fine-Tuning of Constants", summary: "The narrow life-permitting ranges of fundamental constants and initial conditions." },
      { slug: "multiverse-objection", title: "The Multiverse Objection", summary: "Whether positing many universes explains away the appearance of fine-tuning." },
    ],
  },
  {
    slug: "origin-of-life",
    title: "Origin of Life & Biological Information",
    summary: "The origin of life, DNA, and biological information.",
    topics: [
      { slug: "biological-information", title: "The Origin of Biological Information", summary: "Where the functional information in DNA came from, and competing explanations." },
      { slug: "interpretation-layers", title: "Observation vs. Interpretation", summary: "Carefully separating scientific data, scientific interpretation, philosophy, and theology." },
    ],
  },
  {
    slug: "objective-morality",
    title: "Objective Morality",
    summary: "Whether moral facts and duties are real and how worldviews explain them.",
    topics: [
      { slug: "moral-facts", title: "Are There Moral Facts?", summary: "Objective vs. subjective accounts of right and wrong." },
      { slug: "grounding-morality", title: "Grounding Moral Duties", summary: "How different worldviews try to ground obligation, dignity, and human rights." },
    ],
  },
  {
    slug: "consciousness-reason-free-will",
    title: "Consciousness, Reason & Free Will",
    summary: "Mind, rationality, and freedom under competing worldviews.",
    topics: [
      { slug: "argument-from-reason", title: "The Argument from Reason", summary: "Whether a purely naturalistic account can underwrite trust in reason itself." },
      { slug: "hard-problem", title: "The Hard Problem of Consciousness", summary: "Why subjective experience is difficult to reduce to physical description." },
    ],
  },
  {
    slug: "biblical-reliability",
    title: "Biblical Reliability",
    summary: "Transmission, manuscripts, and textual criticism of the Bible.",
    topics: [
      { slug: "textual-transmission", title: "Textual Transmission", summary: "How the biblical text was copied and what textual criticism can reconstruct." },
    ],
  },
  {
    slug: "new-testament-reliability",
    title: "New Testament Reliability",
    summary: "Dating, authorship, and eyewitness testimony of the Gospels.",
    topics: [
      { slug: "gospel-dating", title: "Dating the Gospels", summary: "When the Gospels were likely written and why dating matters to the discussion." },
      { slug: "eyewitness-testimony", title: "Eyewitness Testimony", summary: "The case that the Gospels draw on eyewitness sources." },
    ],
  },
  {
    slug: "archaeology",
    title: "Archaeology & Historical Corroboration",
    summary: "People, places, and artifacts corroborating the biblical record.",
    topics: [
      { slug: "people-and-places", title: "People, Places & Inscriptions", summary: "Archaeological findings that corroborate names, places, and customs in the text." },
    ],
  },
  {
    slug: "historical-jesus",
    title: "Historical Jesus",
    summary: "What history can establish about Jesus of Nazareth.",
    topics: [
      { slug: "existence-of-jesus", title: "Did Jesus Exist?", summary: "The historical evidence, including non-Christian sources, for Jesus of Nazareth." },
      { slug: "crucifixion", title: "The Crucifixion", summary: "Why Jesus' death by crucifixion is regarded by most historians as well-established." },
    ],
  },
  {
    slug: "resurrection",
    title: "Resurrection of Jesus",
    summary: "The historical case for the resurrection and its alternative explanations.",
    topics: [
      { slug: "minimal-facts", title: "The Minimal-Facts Approach", summary: "Reasoning from data broadly granted across the scholarly spectrum." },
      { slug: "empty-tomb", title: "The Empty Tomb", summary: "Historical arguments offered for the empty tomb." },
      { slug: "appearances", title: "Post-Mortem Appearances", summary: "The reported appearances to disciples, to Paul, and to James." },
      { slug: "alt-hallucination", title: "Objection: Hallucination", summary: "A fair statement of the hallucination hypothesis and a considered response." },
      { slug: "alt-stolen-body", title: "Objection: Stolen Body", summary: "A fair statement of the stolen-body hypothesis and a considered response." },
      { slug: "alt-swoon", title: "Objection: Swoon Theory", summary: "A fair statement of the swoon hypothesis and a considered response." },
      { slug: "alt-legend", title: "Objection: Legend", summary: "A fair statement of the legend hypothesis and a considered response." },
    ],
  },
  {
    slug: "christianity-and-science",
    title: "Christianity & Science",
    summary: "The relationship between scientific inquiry and Christian faith.",
    topics: [
      { slug: "methodological-naturalism", title: "Kinds of Naturalism", summary: "Distinguishing methodological naturalism (a method) from philosophical naturalism (a worldview)." },
    ],
  },
  {
    slug: "miracles",
    title: "Miracles",
    summary: "Whether miracles are possible and how they are evaluated.",
    topics: [
      { slug: "hume-on-miracles", title: "Hume on Miracles", summary: "Assessing the classic argument that testimony can never establish a miracle." },
    ],
  },
  {
    slug: "evil-and-suffering",
    title: "Evil & Suffering",
    summary: "The logical and evidential problems of evil and Christian responses.",
    topics: [
      { slug: "logical-problem", title: "The Logical Problem of Evil", summary: "The free-will defense and the question of logical consistency." },
      { slug: "evidential-problem", title: "The Evidential Problem of Evil", summary: "Probabilistic arguments from the amount and distribution of suffering, and responses." },
    ],
  },
  {
    slug: "worldviews",
    title: "Worldviews",
    summary: "How major worldviews compare in explaining reality.",
    topics: [
      { slug: "worldview-comparison", title: "Comparing Worldviews", summary: "How worldviews answer origin, meaning, morality, knowledge, and destiny." },
    ],
  },
  {
    slug: "common-objections",
    title: "Common Objections",
    summary: "Fair treatments of frequently raised objections to Christianity.",
    topics: [
      { slug: "who-created-god", title: "Who Created God?", summary: "Why the question assumes God is the kind of thing that begins to exist." },
      { slug: "bible-changed", title: "Has the Bible Been Changed?", summary: "What textual transmission does and does not imply about reliability." },
      { slug: "copied-from-pagan", title: "Was Christianity Copied from Pagan Myths?", summary: "Assessing the 'copycat' thesis against the historical evidence." },
    ],
  },
];

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
export function getCategory(slug: string): Category | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

// Featured "Case for Christianity" guided pathway (ordered steps).
export const CASE_PATHWAY: { title: string; categorySlug: string; topicSlug?: string }[] = [
  { title: "How Do We Know What Is True?", categorySlug: "consciousness-reason-free-will", topicSlug: "argument-from-reason" },
  { title: "Does God Exist?", categorySlug: "does-god-exist" },
  { title: "Why Does the Universe Exist?", categorySlug: "origin-of-the-universe" },
  { title: "Fine-Tuning", categorySlug: "fine-tuning" },
  { title: "Origin of Life", categorySlug: "origin-of-life" },
  { title: "Objective Morality", categorySlug: "objective-morality" },
  { title: "Consciousness and Reason", categorySlug: "consciousness-reason-free-will" },
  { title: "Is the Bible Reliable?", categorySlug: "new-testament-reliability" },
  { title: "Did Jesus Exist?", categorySlug: "historical-jesus", topicSlug: "existence-of-jesus" },
  { title: "Was Jesus Crucified?", categorySlug: "historical-jesus", topicSlug: "crucifixion" },
  { title: "What Happened After Jesus Died?", categorySlug: "resurrection", topicSlug: "empty-tomb" },
  { title: "Evidence for the Resurrection", categorySlug: "resurrection", topicSlug: "minimal-facts" },
  { title: "Alternative Explanations", categorySlug: "resurrection", topicSlug: "alt-hallucination" },
  { title: "Which Worldview Best Explains the Evidence?", categorySlug: "worldviews" },
];
