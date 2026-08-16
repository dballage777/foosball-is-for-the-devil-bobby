-- =====================================================================
-- 0005_seed_apologetics.sql — Seed content for the apologetics library.
--
-- SOURCING RULE: only URLs that have been explicitly provided/verified are
-- inserted with verified = true. No resource URL is invented here. Deeper
-- per-topic resource research is tracked in docs/apologetics-research.md and
-- must be added only after each URL is confirmed to resolve.
-- =====================================================================

-- ---- Sources (official ministries; URLs provided/verified) --------------
insert into apologetics_sources (name, slug, website_url, description, official) values
  ('Cold-Case Christianity', 'cold-case-christianity', 'https://coldcasechristianity.com/',
   'J. Warner Wallace — cold-case detective examining the claims of Christianity using investigative methodology.', true),
  ('Cross Examined', 'cross-examined', 'https://crossexamined.org/',
   'Frank Turek''s ministry equipping Christians to give reasons for their faith.', true),
  ('John Lennox', 'john-lennox', 'https://johnlennox.org/',
   'Oxford mathematician and philosopher of science engaging questions of God, science, and faith.', true)
on conflict (slug) do nothing;

-- ---- Verified official channel/show resources (explicitly provided) -----
insert into apologetics_resources
  (source_id, title, slug, description, resource_type, url, verified, official, featured)
select s.id, v.title, v.slug, v.description, v.rtype::resource_type, v.url, true, true, v.featured
from (values
  ('cold-case-christianity', 'Cold-Case Christianity — Website',
    'ccc-website', 'Articles and case-making resources from J. Warner Wallace.',
    'external_resource', 'https://coldcasechristianity.com/', true),
  ('cold-case-christianity', 'Cold-Case Christianity — Podcast (Spotify)',
    'ccc-spotify', 'The Cold-Case Christianity podcast on Spotify.',
    'spotify_show', 'https://open.spotify.com/show/7aSbO4B9TAnP4unGDhpKhL', false),
  ('cold-case-christianity', 'Cold-Case Christianity — YouTube',
    'ccc-youtube', 'Official Cold-Case Christianity YouTube channel.',
    'youtube_channel', 'https://m.youtube.com/@ColdCaseChristianity', false),
  ('cross-examined', 'Cross Examined — Website',
    'ce-website', 'Frank Turek''s apologetics ministry and articles.',
    'external_resource', 'https://crossexamined.org/', true),
  ('cross-examined', 'Cross Examined — Podcast (Spotify)',
    'ce-spotify', 'The Cross Examined podcast on Spotify.',
    'spotify_show', 'https://open.spotify.com/show/33MgzSFOheNQ8BnxMGbDOv', false),
  ('cross-examined', 'Cross Examined — YouTube',
    'ce-youtube', 'Official Cross Examined YouTube channel.',
    'youtube_channel', 'https://m.youtube.com/@CrossExamined', false),
  ('john-lennox', 'John Lennox — Official Website',
    'lennox-website', 'Books, articles, talks, and resources from John Lennox.',
    'external_resource', 'https://johnlennox.org/', true)
) as v(source_slug, title, slug, description, rtype, url, featured)
join apologetics_sources s on s.slug = v.source_slug
on conflict (slug) do nothing;

-- ---- Categories (16 evidence areas) -------------------------------------
insert into apologetics_categories (slug, title, summary, sort_order) values
  ('does-god-exist', 'Does God Exist?', 'Cosmological, contingency, design, moral, and consciousness arguments for God.', 1),
  ('origin-of-the-universe', 'Origin of the Universe', 'Why the universe began and why anything exists at all.', 2),
  ('fine-tuning', 'Fine-Tuning', 'The life-permitting balance of physical constants and initial conditions.', 3),
  ('origin-of-life', 'Origin of Life & Biological Information', 'The origin of life, DNA, and biological information.', 4),
  ('objective-morality', 'Objective Morality', 'Whether moral facts and duties are real and how worldviews explain them.', 5),
  ('consciousness-reason-free-will', 'Consciousness, Reason & Free Will', 'Mind, rationality, and freedom under competing worldviews.', 6),
  ('biblical-reliability', 'Biblical Reliability', 'Transmission, manuscripts, and textual criticism of the Bible.', 7),
  ('new-testament-reliability', 'New Testament Reliability', 'Dating, authorship, and eyewitness testimony of the Gospels.', 8),
  ('archaeology', 'Archaeology & Historical Corroboration', 'People, places, and artifacts corroborating the biblical record.', 9),
  ('historical-jesus', 'Historical Jesus', 'What history can establish about Jesus of Nazareth.', 10),
  ('resurrection', 'Resurrection of Jesus', 'The historical case for the resurrection and its alternative explanations.', 11),
  ('christianity-and-science', 'Christianity & Science', 'The relationship between scientific inquiry and Christian faith.', 12),
  ('miracles', 'Miracles', 'Whether miracles are possible and how they are evaluated.', 13),
  ('evil-and-suffering', 'Evil & Suffering', 'The logical and evidential problems of evil and Christian responses.', 14),
  ('worldviews', 'Worldviews', 'How major worldviews compare in explaining reality.', 15),
  ('common-objections', 'Common Objections', 'Fair treatments of frequently raised objections to Christianity.', 16)
on conflict (slug) do nothing;

-- ---- Topics (representative; expand via research doc) -------------------
insert into apologetics_topics (category_id, slug, title, summary, sort_order)
select c.id, t.slug, t.title, t.summary, t.sort_order
from (values
  ('does-god-exist', 'cosmological-argument', 'The Cosmological Argument', 'From the beginning of the universe to a first cause.', 1),
  ('does-god-exist', 'contingency-argument', 'The Argument from Contingency', 'Why there is something rather than nothing.', 2),
  ('does-god-exist', 'design-argument', 'The Design Argument', 'Apparent design in nature and its best explanation.', 3),
  ('does-god-exist', 'moral-argument', 'The Moral Argument', 'From objective moral values and duties to God.', 4),
  ('origin-of-the-universe', 'universe-had-a-beginning', 'Did the Universe Begin?', 'Cosmological and philosophical reasons for a beginning.', 1),
  ('origin-of-the-universe', 'cause-of-the-universe', 'What Caused the Universe?', 'Candidate explanations and their adequacy.', 2),
  ('fine-tuning', 'physical-constants', 'Fine-Tuning of Constants', 'Life-permitting values of the fundamental constants.', 1),
  ('fine-tuning', 'multiverse-objection', 'The Multiverse Objection', 'Does a multiverse explain away fine-tuning?', 2),
  ('origin-of-life', 'biological-information', 'The Origin of Biological Information', 'Where the information in DNA came from.', 1),
  ('origin-of-life', 'interpretation-layers', 'Observation vs. Interpretation', 'Distinguishing data, scientific interpretation, and philosophy.', 2),
  ('objective-morality', 'moral-facts', 'Are There Moral Facts?', 'Objective vs. subjective accounts of morality.', 1),
  ('objective-morality', 'grounding-morality', 'Grounding Moral Duties', 'How different worldviews ground obligation and dignity.', 2),
  ('consciousness-reason-free-will', 'argument-from-reason', 'The Argument from Reason', 'Can naturalism account for rational thought?', 1),
  ('consciousness-reason-free-will', 'hard-problem', 'The Hard Problem of Consciousness', 'Why subjective experience resists physical reduction.', 2),
  ('biblical-reliability', 'textual-transmission', 'Textual Transmission', 'How the text was copied and what we can reconstruct.', 1),
  ('new-testament-reliability', 'gospel-dating', 'Dating the Gospels', 'When the Gospels were written and why it matters.', 1),
  ('new-testament-reliability', 'eyewitness-testimony', 'Eyewitness Testimony', 'The case that the Gospels rest on eyewitness sources.', 2),
  ('archaeology', 'people-and-places', 'People, Places & Inscriptions', 'Archaeological corroboration of the biblical record.', 1),
  ('historical-jesus', 'existence-of-jesus', 'Did Jesus Exist?', 'The historical evidence for Jesus of Nazareth.', 1),
  ('historical-jesus', 'crucifixion', 'The Crucifixion', 'Why Jesus'' death by crucifixion is widely accepted history.', 2),
  ('resurrection', 'minimal-facts', 'The Minimal-Facts Approach', 'Building a case from data broadly granted by scholars.', 1),
  ('resurrection', 'empty-tomb', 'The Empty Tomb', 'Historical arguments for the empty tomb.', 2),
  ('resurrection', 'appearances', 'Post-Mortem Appearances', 'The reported appearances to disciples, Paul, and James.', 3),
  ('resurrection', 'alt-hallucination', 'Objection: Hallucination', 'Fair statement and response to the hallucination hypothesis.', 4),
  ('resurrection', 'alt-stolen-body', 'Objection: Stolen Body', 'Fair statement and response to the stolen-body hypothesis.', 5),
  ('resurrection', 'alt-swoon', 'Objection: Swoon Theory', 'Fair statement and response to the swoon hypothesis.', 6),
  ('resurrection', 'alt-legend', 'Objection: Legend', 'Fair statement and response to the legend hypothesis.', 7),
  ('christianity-and-science', 'methodological-naturalism', 'Kinds of Naturalism', 'Methodological vs. philosophical naturalism.', 1),
  ('miracles', 'hume-on-miracles', 'Hume on Miracles', 'Assessing the classic argument against miracles.', 1),
  ('evil-and-suffering', 'logical-problem', 'The Logical Problem of Evil', 'The free-will defense and logical consistency.', 1),
  ('evil-and-suffering', 'evidential-problem', 'The Evidential Problem of Evil', 'Probabilistic arguments from suffering and responses.', 2),
  ('worldviews', 'worldview-comparison', 'Comparing Worldviews', 'How worldviews answer origin, meaning, morality, and destiny.', 1),
  ('common-objections', 'who-created-god', 'Who Created God?', 'Why the question assumes God is a contingent being.', 1),
  ('common-objections', 'bible-changed', 'Has the Bible Been Changed?', 'Transmission and the reliability of the text.', 2),
  ('common-objections', 'copied-from-pagan', 'Was Christianity Copied from Pagan Myths?', 'Assessing the copycat thesis.', 3)
) as t(cat_slug, slug, title, summary, sort_order)
join apologetics_categories c on c.slug = t.cat_slug
on conflict (category_id, slug) do nothing;

-- ---- Curated, non-arbitrary Scripture <-> apologetics links -------------
insert into bible_apologetics_links (book_slug, chapter, verse_start, verse_end, topic_id, note)
select l.book_slug, l.chapter, l.vs, l.ve, tp.id, l.note
from (values
  ('1-peter', 3, 15, 16, 'does-god-exist', 'cosmological-argument',
    'The biblical mandate to give a reasoned defense ("give an answer") for hope in Christ.'),
  ('john', 20, null, null, 'resurrection', 'appearances',
    'Resurrection appearances, including to Thomas.'),
  ('1-corinthians', 15, 3, 8, 'resurrection', 'minimal-facts',
    'Early creed listing death, burial, resurrection, and appearances.'),
  ('romans', 1, 19, 20, 'does-god-exist', 'design-argument',
    'General revelation: God''s attributes perceived through creation.'),
  ('genesis', 1, 1, 1, 'origin-of-the-universe', 'universe-had-a-beginning',
    'The universe has a beginning: "In the beginning God created..."'),
  ('psalms', 19, 1, 4, 'does-god-exist', 'design-argument',
    'Natural revelation: the heavens declare the glory of God.')
) as l(book_slug, chapter, vs, ve, cat_slug, topic_slug, note)
join apologetics_categories c on c.slug = l.cat_slug
join apologetics_topics tp on tp.category_id = c.id and tp.slug = l.topic_slug
on conflict (book_slug, chapter, topic_id) do nothing;
