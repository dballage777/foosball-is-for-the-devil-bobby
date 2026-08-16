// Apologetics taxonomy + original educational prose.
// Slugs here MUST match the seed in supabase/migrations/0005 so that
// bible_apologetics_links anchors resolve. Prose is original summary writing
// (not copied from copyrighted works) and is intentionally careful not to
// overstate scholarly consensus or manuscript statistics. Opposing views are
// stated fairly before any response is offered.

export interface Topic {
  slug: string;
  title: string;
  summary: string;
  /** Original explanatory prose, one string per paragraph. */
  body?: string[];
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
      {
        slug: "cosmological-argument",
        title: "The Cosmological Argument",
        summary:
          "If the universe began to exist, it is reasonable to ask what caused it to begin.",
        body: [
          "The Kalam version of the cosmological argument runs: whatever begins to exist has a cause; the universe began to exist; therefore the universe has a cause. The first premise reflects ordinary experience — things that come into being do so because of something.",
          "The second premise is supported both philosophically (the difficulty of an actually infinite past) and by mainstream cosmology, which describes an expanding universe with a finite past on standard models. Neither line of support is beyond dispute, and cosmology is provisional, so the argument is offered as a reasonable inference rather than a proof.",
          "If sound, the cause of space, time, and matter would itself be spaceless, timeless, and immensely powerful — properties classical theism attributes to God. The argument does not by itself deliver the full Christian God; it points toward a transcendent cause and invites further questions.",
        ],
      },
      {
        slug: "contingency-argument",
        title: "The Argument from Contingency",
        summary:
          "Why there is something rather than nothing, and whether a necessary being best explains it.",
        body: [
          "Contingency arguments ask not what started the universe but why anything exists at all. Contingent things could have failed to exist; they depend on something else for their existence. A collection of only contingent things seems to leave the whole unexplained.",
          "The argument proposes that the best explanation is a being whose existence is necessary — that does not depend on anything else. Critics reply that the universe itself might be the necessary, brute fact, or that the 'principle of sufficient reason' is too strong.",
          "The debate turns on whether it is more reasonable to treat the universe as a brute fact or to posit a necessary ground of being. Christians argue the latter is more explanatory and coheres with a God who exists 'of himself.'",
        ],
      },
      {
        slug: "design-argument",
        title: "The Design Argument",
        summary:
          "Whether apparent design in nature is better explained by intention than by chance alone.",
        body: [
          "Design arguments observe features of the world that look purpose-built — the fine-tuning of physics, the information-rich structure of living cells — and argue that intention explains them better than unguided processes.",
          "Opponents point to natural selection as a designer-mimicking mechanism for biology, and to chance plus large numbers for other cases. Proponents respond that some features (like the initial constants of physics) are not products of selection at all.",
          "Honest versions of the argument distinguish observation (the data) from interpretation (what best explains it), and treat it as an inference to the best explanation rather than a knock-down proof.",
        ],
      },
      {
        slug: "moral-argument",
        title: "The Moral Argument",
        summary:
          "If objective moral values and duties exist, what best grounds them?",
        body: [
          "The moral argument claims: if objective moral values and duties exist, God is the best explanation of them; such values and duties do exist; therefore God plausibly exists. 'Objective' means true independent of what anyone thinks — that torturing the innocent for fun is really wrong, not merely disliked.",
          "The strongest objection denies the first premise: perhaps morality is grounded in human flourishing, social contract, or evolved intuitions without God. Defenders reply that these accounts explain moral feelings or behavior better than binding obligations.",
          "The argument does not claim atheists are immoral — many live admirably. It asks which worldview best accounts for morality being real and authoritative.",
        ],
      },
    ],
  },
  {
    slug: "origin-of-the-universe",
    title: "Origin of the Universe",
    summary: "Why the universe began and why anything exists at all.",
    topics: [
      {
        slug: "universe-had-a-beginning",
        title: "Did the Universe Begin?",
        summary:
          "Cosmological and philosophical reasons often given for a beginning of space, time, and matter.",
        body: [
          "On standard Big Bang cosmology, the observable universe has a finite age (currently estimated near 13.8 billion years) and has been expanding from a hot, dense early state. Several theorems suggest that classically expanding universes are past-incomplete.",
          "This remains an active research area: quantum-gravity, cyclic, and multiverse proposals explore whether the beginning is absolute or a transition. None is established, and cosmology is revisable.",
          "For apologetics, the honest claim is modest: the best-supported models describe a universe with a finite past, which is at least consistent with, and arguably suggestive of, a beginning that calls for explanation.",
        ],
      },
      {
        slug: "cause-of-the-universe",
        title: "What Caused the Universe?",
        summary:
          "Candidate explanations — necessity, chance, or a transcendent cause — and how they are assessed.",
        body: [
          "If the universe began, candidate explanations include: it is uncaused (a brute fact), it is self-caused or necessary, it emerged from a prior physical state, or it was caused by something transcendent.",
          "Naturalistic proposals push the explanation to a prior physical framework (a quantum vacuum, a multiverse), which then itself needs accounting. Theists argue a timeless, personal cause best explains why a temporal effect began at all.",
          "The disagreement is philosophical as much as scientific, and reasonable people land differently. The Christian claim is that a personal Creator is the most satisfying terminus of explanation.",
        ],
      },
    ],
  },
  {
    slug: "fine-tuning",
    title: "Fine-Tuning",
    summary: "The life-permitting balance of physical constants and initial conditions.",
    topics: [
      {
        slug: "physical-constants",
        title: "Fine-Tuning of Constants",
        summary:
          "The narrow life-permitting ranges of fundamental constants and initial conditions.",
        body: [
          "Several constants of physics and features of the early universe fall within narrow ranges that permit a life-supporting cosmos. Small changes to, for example, the strength of the forces or the early expansion rate would apparently yield a universe without stable structures.",
          "Three broad explanations compete: physical necessity (the values could not be otherwise), chance (we happen to be in a life-permitting universe), and design. Each faces challenges — necessity lacks a known reason; chance invites the multiverse; design raises further questions.",
          "The evidence is genuinely striking but is interpreted differently by careful thinkers. Christians take fine-tuning as one reasonable pointer toward a purposeful Creator.",
        ],
      },
      {
        slug: "multiverse-objection",
        title: "The Multiverse Objection",
        summary:
          "Whether positing many universes explains away the appearance of fine-tuning.",
        body: [
          "The multiverse reply says that if there are vast numbers of universes with varying constants, at least some will be life-permitting, and of course we find ourselves in one of those. On this view fine-tuning needs no designer.",
          "Responses note that many multiverse models are difficult to test, that some proposals still require their own fine-tuning (a universe-generating mechanism), and that a multiverse and a Creator are not mutually exclusive.",
          "The exchange is a live scientific and philosophical debate. The honest apologetic point is that the multiverse is a serious idea, not a settled refutation.",
        ],
      },
    ],
  },
  {
    slug: "origin-of-life",
    title: "Origin of Life & Biological Information",
    summary: "The origin of life, DNA, and biological information.",
    topics: [
      {
        slug: "biological-information",
        title: "The Origin of Biological Information",
        summary:
          "Where the functional information in DNA came from, and competing explanations.",
        body: [
          "Living cells store and process information in DNA, which specifies proteins through a code-like system. Explaining the origin of the first self-replicating, information-bearing system is an unsolved scientific problem.",
          "Researchers pursue chemical-evolution scenarios (RNA world, metabolism-first, mineral surfaces). Design proponents argue that the specified information resembles the products of intelligence. Both are interpretations of an incomplete data set.",
          "Intellectual honesty means acknowledging the open questions without overclaiming. 'We don't yet know' is the current scientific state; how one weighs design as an inference is where worldviews differ.",
        ],
      },
      {
        slug: "interpretation-layers",
        title: "Observation vs. Interpretation",
        summary:
          "Carefully separating scientific data, scientific interpretation, philosophy, and theology.",
        body: [
          "Clear thinking distinguishes four layers: the observation (what is measured), the scientific interpretation (the best current model), the philosophical interpretation (what it implies about reality), and the theological conclusion (what it means about God).",
          "Confusion arises when a philosophical claim ('nature is all there is') is presented as if it were a scientific result, or when a theological reading is treated as settled data.",
          "This distinction cuts both ways and keeps the conversation fair: it restrains overclaiming by naturalists and by believers alike.",
        ],
      },
    ],
  },
  {
    slug: "objective-morality",
    title: "Objective Morality",
    summary: "Whether moral facts and duties are real and how worldviews explain them.",
    topics: [
      {
        slug: "moral-facts",
        title: "Are There Moral Facts?",
        summary: "Objective vs. subjective accounts of right and wrong.",
        body: [
          "Most people act as though some things are really wrong — cruelty to the innocent, for instance — not merely unfashionable. Moral realism holds that such judgments can be objectively true.",
          "Anti-realists argue morality is a projection of feelings, culture, or evolved instincts, with no truth-value beyond that. The realist replies that this struggles to account for moral progress and for the wrongness of atrocities even where a culture approved them.",
          "If there are genuine moral facts, the next question is what grounds them — the concern of the following topic.",
        ],
      },
      {
        slug: "grounding-morality",
        title: "Grounding Moral Duties",
        summary:
          "How different worldviews try to ground obligation, dignity, and human rights.",
        body: [
          "Accounts of moral grounding include human flourishing, social contracts, evolutionary fitness, Platonic moral facts, and theism. Each explains part of the picture.",
          "Naturalistic accounts can explain why we have moral feelings but face a harder task explaining binding obligation and equal human dignity. Theism grounds dignity in humans being made in God's image and duties in the character of a good God.",
          "The claim is comparative, not a charge against non-believers: it asks which framework best makes sense of morality's authority.",
        ],
      },
    ],
  },
  {
    slug: "consciousness-reason-free-will",
    title: "Consciousness, Reason & Free Will",
    summary: "Mind, rationality, and freedom under competing worldviews.",
    topics: [
      {
        slug: "argument-from-reason",
        title: "The Argument from Reason",
        summary: "Whether a purely naturalistic account can underwrite trust in reason itself.",
        body: [
          "The argument from reason asks: if all our thoughts are the products of non-rational physical causes selected for survival, why trust them to track truth? Rational inference seems to require that we believe conclusions because of the reasons, not merely because of prior physical states.",
          "Naturalists reply that natural selection favors reliable cognition, and that reasons can be realized in physical processes. Defenders answer that survival value and truth can come apart, and that grounding reason is easier if mind is more than matter.",
          "The topic connects to how we know anything at all, which is why the guided pathway begins here.",
        ],
      },
      {
        slug: "hard-problem",
        title: "The Hard Problem of Consciousness",
        summary: "Why subjective experience is difficult to reduce to physical description.",
        body: [
          "The 'hard problem' is explaining why there is something it is like to be you — the felt quality of experience — rather than mere information processing in the dark. Physical descriptions seem to leave this out.",
          "Positions range from reductive physicalism to property dualism, panpsychism, and substance dualism. There is no consensus, and the problem is taken seriously across secular and religious philosophy.",
          "For theists, consciousness is unsurprising if reality is fundamentally mind-like or created by a conscious God; but the argument is offered modestly, given genuine disagreement.",
        ],
      },
    ],
  },
  {
    slug: "biblical-reliability",
    title: "Biblical Reliability",
    summary: "Transmission, manuscripts, and textual criticism of the Bible.",
    topics: [
      {
        slug: "textual-transmission",
        title: "Textual Transmission",
        summary: "How the biblical text was copied and what textual criticism can reconstruct.",
        body: [
          "The New Testament survives in a large number of Greek manuscripts and early translations, more than for most other ancient works. This wealth of copies contains many variants — the vast majority trivial (spelling, word order) — which textual critics compare to reconstruct the earliest wording.",
          "It is important not to overstate the case: quantity of copies is not the same as certainty about every word, and a few variants are meaningful and openly discussed by scholars. What critics generally hold is that the text can be reconstructed with a high degree of confidence, and that no central Christian teaching hangs on a disputed reading.",
          "The honest summary is: the transmission is well-attested and reconstructable, while acknowledging real variants and the ordinary limits of ancient evidence.",
        ],
      },
    ],
  },
  {
    slug: "new-testament-reliability",
    title: "New Testament Reliability",
    summary: "Dating, authorship, and eyewitness testimony of the Gospels.",
    topics: [
      {
        slug: "gospel-dating",
        title: "Dating the Gospels",
        summary: "When the Gospels were likely written and why dating matters to the discussion.",
        body: [
          "Most scholars date the four Gospels to the second half of the first century, within living memory of the events, with Mark commonly placed earliest. Some scholars argue for earlier dates, others later; the ranges are debated.",
          "Earlier dating matters because it shortens the gap between events and record, limiting time for pure legend to displace memory. But dating alone does not settle historicity — early sources can still err, and late sources can preserve good tradition.",
          "The measured claim is that the Gospels are relatively early sources by the standards of ancient history, which is a point in favor of taking them seriously as testimony.",
        ],
      },
      {
        slug: "eyewitness-testimony",
        title: "Eyewitness Testimony",
        summary: "The case that the Gospels draw on eyewitness sources.",
        body: [
          "Some scholars argue that the Gospels preserve eyewitness testimony — through named characters, incidental details, and patterns of memory — rather than being free-floating folklore. Others are more skeptical, seeing significant shaping by later communities.",
          "The evidence is a matter of degree and interpretation, and specialists disagree. Even granting eyewitness roots, testimony must still be weighed, not merely accepted.",
          "The reasonable position is that the eyewitness case is serious and defensible without being universally conceded.",
        ],
      },
    ],
  },
  {
    slug: "archaeology",
    title: "Archaeology & Historical Corroboration",
    summary: "People, places, and artifacts corroborating the biblical record.",
    topics: [
      {
        slug: "people-and-places",
        title: "People, Places & Inscriptions",
        summary: "Archaeological findings that corroborate names, places, and customs in the text.",
        body: [
          "Archaeology has confirmed many people, places, titles, and customs mentioned in Scripture — for example, inscriptions naming figures and officials, and sites matching described locations. Such finds show the writers knew their world.",
          "Corroboration of background details is not the same as proving every event, and archaeology cannot verify theological claims. Some biblical events leave little or no material trace, and interpretations of finds are sometimes contested.",
          "The fair conclusion is that the biblical writers are frequently accurate about their historical and geographical setting, which supports their general credibility without settling every question.",
        ],
      },
    ],
  },
  {
    slug: "historical-jesus",
    title: "Historical Jesus",
    summary: "What history can establish about Jesus of Nazareth.",
    topics: [
      {
        slug: "existence-of-jesus",
        title: "Did Jesus Exist?",
        summary: "The historical evidence, including non-Christian sources, for Jesus of Nazareth.",
        body: [
          "The existence of Jesus as a first-century Jewish teacher who was crucified is accepted by the overwhelming majority of historians, religious or not. Evidence includes early Christian sources and references in non-Christian writers such as Tacitus and Josephus.",
          "'Mythicism' — the claim Jesus never existed — is a fringe position among specialists. Debate concentrates not on whether Jesus existed but on the interpretation of what he said and did.",
          "So the honest starting point is broad agreement on his existence and execution, with vigorous disagreement about the meaning of his life.",
        ],
      },
      {
        slug: "crucifixion",
        title: "The Crucifixion",
        summary: "Why Jesus' death by crucifixion is regarded by most historians as well-established.",
        body: [
          "Jesus' death by Roman crucifixion is one of the most widely accepted facts about him, affirmed by early Christian and non-Christian sources and unlikely to have been invented by followers, since a crucified messiah was a stumbling block in that culture.",
          "This 'criterion of embarrassment' — that people rarely fabricate details that undercut their cause — is one reason historians across the spectrum treat the crucifixion as secure.",
          "The crucifixion is the shared historical anchor from which questions about the resurrection proceed.",
        ],
      },
    ],
  },
  {
    slug: "resurrection",
    title: "Resurrection of Jesus",
    summary: "The historical case for the resurrection and its alternative explanations.",
    topics: [
      {
        slug: "minimal-facts",
        title: "The Minimal-Facts Approach",
        summary: "Reasoning from data broadly granted across the scholarly spectrum.",
        body: [
          "The minimal-facts approach builds only on data accepted by a broad range of scholars, such as Jesus' death by crucifixion, the disciples' sincere belief that they saw him alive afterward, and the transformation of skeptics like Paul.",
          "The argument is that the resurrection best explains these agreed data taken together, better than competing hypotheses. It deliberately brackets disputed claims to keep the reasoning on common ground.",
          "Critics contest whether the resurrection is truly the best explanation and whether all the 'facts' are as agreed as claimed. The following topics examine the specific data and the main alternatives fairly.",
        ],
      },
      {
        slug: "empty-tomb",
        title: "The Empty Tomb",
        summary: "Historical arguments offered for the empty tomb.",
        body: [
          "Arguments for the empty tomb include early testimony, the report that women were the first witnesses (unlikely to be invented in that context), and the absence of a venerated tomb containing the body, which one might expect if it were occupied.",
          "The empty tomb is less universally granted than the crucifixion; a significant number of scholars accept it, but not all. Even if granted, an empty tomb by itself does not prove resurrection — it requires explanation.",
          "So the empty tomb functions as one strand of evidence to be weighed alongside the appearances, not as a stand-alone proof.",
        ],
      },
      {
        slug: "appearances",
        title: "Post-Mortem Appearances",
        summary: "The reported appearances to disciples, to Paul, and to James.",
        body: [
          "Multiple early sources report that individuals and groups believed they encountered the risen Jesus, including the inner circle, the skeptic James, and the persecutor Paul. An early creedal summary in 1 Corinthians 15 lists such appearances.",
          "What is widely granted is that these people sincerely believed they saw Jesus; what that experience was is the point of dispute. Naturalistic explanations appeal to hallucination or misidentification; the resurrection hypothesis takes the experiences as veridical.",
          "The appearances, especially to hostile witnesses, are among the strongest data the resurrection argument leans on.",
        ],
      },
      {
        slug: "alt-hallucination",
        title: "Objection: Hallucination",
        summary: "A fair statement of the hallucination hypothesis and a considered response.",
        body: [
          "The objection: the disciples were grieving and expectant, and grief can produce vivid experiences of a lost loved one; their 'appearances' were hallucinations or bereavement visions, not a raised body.",
          "Strongest form: such experiences are documented, can feel utterly real, and could spread through a close-knit, expectant group, especially given the psychology of grief and devotion.",
          "Response: hallucinations are typically private and individual, which fits poorly with reports of group appearances; they would not produce an empty tomb; and they struggle to explain the conversion of a hostile skeptic (Paul) who was not grieving or expecting a risen Jesus. The reply is offered as a weighing of explanatory power, not a dismissal. See linked resources for detailed treatments.",
        ],
      },
      {
        slug: "alt-stolen-body",
        title: "Objection: Stolen Body",
        summary: "A fair statement of the stolen-body hypothesis and a considered response.",
        body: [
          "The objection: someone — the disciples, authorities, or others — removed the body, and the empty tomb was later interpreted as resurrection.",
          "Strongest form: tomb robbery was not unknown, and an empty tomb is compatible with an ordinary removal without any miracle.",
          "Response: a stolen body does not by itself produce sincere, transformative experiences of a living Jesus, nor explain why followers would die for what they would know to be a fraud; authorities motivated to produce a body could have done so. As with all these topics, the aim is fair comparison of hypotheses, and readers should consult primary sources.",
        ],
      },
      {
        slug: "alt-swoon",
        title: "Objection: Swoon Theory",
        summary: "A fair statement of the swoon hypothesis and a considered response.",
        body: [
          "The objection: Jesus did not die on the cross but lost consciousness, later revived, and was mistaken for one raised from death.",
          "Strongest form: reports of survival from severe ordeals are not unheard of, and ancient death determinations were imperfect.",
          "Response: Roman executioners were practiced at ensuring death, and a severely wounded survivor would present as a victim needing care, not as a triumphant conqueror of death capable of inspiring the resurrection proclamation. Most historians regard the death as secure (see the Crucifixion topic).",
        ],
      },
      {
        slug: "alt-legend",
        title: "Objection: Legend",
        summary: "A fair statement of the legend hypothesis and a considered response.",
        body: [
          "The objection: the resurrection is a legend that grew over decades as the story was retold, embellished from a simpler original.",
          "Strongest form: legends do accrue around revered figures, and oral transmission can amplify claims over time.",
          "Response: the resurrection proclamation and creedal formulas appear very early, within a few years of the events by common dating, which is arguably too soon for full legendary development, and named living witnesses could be consulted. The strength of this reply depends on dating, which is itself debated — an honest exchange, not a slam dunk.",
        ],
      },
    ],
  },
  {
    slug: "christianity-and-science",
    title: "Christianity & Science",
    summary: "The relationship between scientific inquiry and Christian faith.",
    topics: [
      {
        slug: "methodological-naturalism",
        title: "Kinds of Naturalism",
        summary:
          "Distinguishing methodological naturalism (a method) from philosophical naturalism (a worldview).",
        body: [
          "Methodological naturalism is the working practice of seeking natural explanations within science. Philosophical naturalism is the metaphysical claim that nature is all that exists. The first is a method; the second is a worldview.",
          "Many scientists, religious and secular, use the method without endorsing the worldview. Confusing the two makes it seem as though science itself proves there is no God, which is a philosophical add-on rather than a scientific finding.",
          "On this view, Christianity and the scientific enterprise are compatible, and much of science historically grew in a theistic context that expected an orderly, intelligible creation.",
        ],
      },
    ],
  },
  {
    slug: "miracles",
    title: "Miracles",
    summary: "Whether miracles are possible and how they are evaluated.",
    topics: [
      {
        slug: "hume-on-miracles",
        title: "Hume on Miracles",
        summary: "Assessing the classic argument that testimony can never establish a miracle.",
        body: [
          "David Hume argued that a wise person proportions belief to evidence, and since the uniform experience of natural law is strong evidence against a miracle, testimony for one is always outweighed.",
          "Critics respond that the argument can beg the question — if one assumes uniform experience against miracles, one has effectively assumed the conclusion — and that Bayesian reasoning shows sufficiently strong or independent testimony can raise the probability of a rare event.",
          "The live question is not whether miracles are common (they are by definition rare) but whether evidence could ever justify believing one occurred. Christians argue it can, in principle and in the case of the resurrection.",
        ],
      },
    ],
  },
  {
    slug: "evil-and-suffering",
    title: "Evil & Suffering",
    summary: "The logical and evidential problems of evil and Christian responses.",
    topics: [
      {
        slug: "logical-problem",
        title: "The Logical Problem of Evil",
        summary: "The free-will defense and the question of logical consistency.",
        body: [
          "The logical problem claims that an all-good, all-powerful God is logically incompatible with the existence of any evil. If God could and would prevent all evil, evil should not exist.",
          "The free-will defense responds that a world with free creatures capable of genuine love may also permit them to choose evil, and that not even omnipotence can make someone freely do good. Many philosophers, including former critics, regard this as showing the two claims are not strictly contradictory.",
          "Establishing logical consistency is a limited victory — it does not explain why God permits the amount of evil we see, which is the evidential problem.",
        ],
      },
      {
        slug: "evidential-problem",
        title: "The Evidential Problem of Evil",
        summary:
          "Probabilistic arguments from the amount and distribution of suffering, and responses.",
        body: [
          "The evidential problem grants that God's existence is possible alongside evil but argues that the sheer quantity and apparent pointlessness of suffering make God unlikely. Gratuitous suffering, especially of the innocent, is the sharpest form.",
          "Responses include the limits of human vantage (we may not see the goods a permission serves), soul-making views, the significance of free will, and, distinctively Christian, a God who enters and shares in suffering at the cross.",
          "This is where apologetics must be most pastoral. No tidy argument answers a grieving person; the Christian claim is not that suffering is good but that it is not the end of the story, and that God is present within it.",
        ],
      },
    ],
  },
  {
    slug: "worldviews",
    title: "Worldviews",
    summary: "How major worldviews compare in explaining reality.",
    topics: [
      {
        slug: "worldview-comparison",
        title: "Comparing Worldviews",
        summary: "How worldviews answer origin, meaning, morality, knowledge, and destiny.",
        body: [
          "A worldview is a framework for answering life's biggest questions: where we came from, whether life has meaning, what grounds morality, how we know things, and what happens at death. Everyone holds one, examined or not.",
          "Comparing worldviews fairly means representing each on its own terms and asking which best accounts for the full range of human experience — reason, morality, consciousness, beauty, and evil — with internal consistency and livability.",
          "The comparison table below sketches how several worldviews answer key questions. It is a simplified starting point, not a caricature; adherents hold rich and varied views, and each deserves study in its own sources.",
        ],
      },
    ],
  },
  {
    slug: "common-objections",
    title: "Common Objections",
    summary: "Fair treatments of frequently raised objections to Christianity.",
    topics: [
      {
        slug: "who-created-god",
        title: "Who Created God?",
        summary: "Why the question assumes God is the kind of thing that begins to exist.",
        body: [
          "The objection: if everything needs a cause, then God needs a cause too, so appealing to God explains nothing.",
          "Response: the cosmological argument's premise is not 'everything has a cause' but 'whatever begins to exist has a cause.' Classical theism defines God as a necessary, eternal being that does not begin to exist, so the question does not arise for God as it does for the universe.",
          "One may still ask whether such a being exists, but 'who created God?' misstates the claim rather than refuting it.",
        ],
      },
      {
        slug: "bible-changed",
        title: "Has the Bible Been Changed?",
        summary: "What textual transmission does and does not imply about reliability.",
        body: [
          "The objection: the Bible was copied by hand for centuries, so we cannot know what it originally said.",
          "Response: textual criticism compares the many manuscripts and early translations to reconstruct the earliest text with considerable confidence; most variants are trivial, and no central teaching depends on a disputed reading. This should be stated without overclaiming — real variants exist and are studied openly.",
          "So the evidence supports a reliably transmitted text, while honestly acknowledging the ordinary uncertainties of ancient documents.",
        ],
      },
      {
        slug: "copied-from-pagan",
        title: "Was Christianity Copied from Pagan Myths?",
        summary: "Assessing the 'copycat' thesis against the historical evidence.",
        body: [
          "The objection: Christianity borrowed its dying-and-rising savior, virgin birth, and other motifs from earlier pagan religions, so it is derivative myth.",
          "Response: specialists generally find the parallels overstated or late — some alleged pagan resurrections postdate Christianity or differ substantially — and early Christianity is deeply rooted in Jewish monotheism and specific, datable historical claims rather than timeless myth.",
          "Fairness cuts both ways: there are real cultural contexts and shared vocabulary, but the strong 'copycat' thesis is not well supported by the sources.",
        ],
      },
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

// Simplified worldview comparison. Rows are questions; columns are worldviews.
// This is an intentionally brief, fair sketch — not a substitute for studying
// each worldview in its own sources.
export const WORLDVIEW_QUESTIONS = [
  "Ultimate reality",
  "Origin",
  "Meaning / purpose",
  "Morality",
  "Human nature",
  "Death / destiny",
] as const;

export interface WorldviewColumn {
  name: string;
  answers: Record<(typeof WORLDVIEW_QUESTIONS)[number], string>;
}

export const WORLDVIEW_TABLE: WorldviewColumn[] = [
  {
    name: "Christianity",
    answers: {
      "Ultimate reality": "A personal, triune God who is distinct from creation.",
      Origin: "The universe and life were created and are sustained by God.",
      "Meaning / purpose": "To know and love God and neighbor; life is purposeful.",
      Morality: "Objective, grounded in God's character; humans bear God's image.",
      "Human nature": "Made in God's image, valuable, yet fallen and in need of grace.",
      "Death / destiny": "Bodily resurrection and life with God; judgment and hope.",
    },
  },
  {
    name: "Atheism / Naturalism",
    answers: {
      "Ultimate reality": "Physical matter/energy; no God or supernatural.",
      Origin: "Universe and life arose by natural processes without design.",
      "Meaning / purpose": "No built-in purpose; meaning is self-created.",
      Morality: "Usually subjective or grounded in human flourishing/consensus.",
      "Human nature": "Highly evolved animals; no immaterial soul on most accounts.",
      "Death / destiny": "Personal existence ends at death.",
    },
  },
  {
    name: "Deism",
    answers: {
      "Ultimate reality": "A creator God who does not intervene in the world.",
      Origin: "God set the universe in motion; it now runs by natural law.",
      "Meaning / purpose": "Purpose from a distant creator; no ongoing revelation.",
      Morality: "Often grounded in reason or a God-given moral order.",
      "Human nature": "Rational creatures of a creator; views on soul vary.",
      "Death / destiny": "Beliefs vary; typically no specific revealed destiny.",
    },
  },
  {
    name: "Pantheism",
    answers: {
      "Ultimate reality": "All is divine; God and the cosmos are one.",
      Origin: "The world is an expression or emanation of the divine.",
      "Meaning / purpose": "Realizing unity with the divine/whole.",
      Morality: "Often tied to harmony, karma, or transcending illusion.",
      "Human nature": "The self is ultimately one with the divine reality.",
      "Death / destiny": "Often cyclical (rebirth) or absorption into the whole.",
    },
  },
  {
    name: '"Spiritual but not religious"',
    answers: {
      "Ultimate reality": "Varied; often a vague higher power or energy.",
      Origin: "Eclectic; no fixed account.",
      "Meaning / purpose": "Personal growth, authenticity, and experience.",
      Morality: "Typically individual and intuition-based.",
      "Human nature": "Emphasis on inner self and personal spirituality.",
      "Death / destiny": "Varied and individually held.",
    },
  },
];
