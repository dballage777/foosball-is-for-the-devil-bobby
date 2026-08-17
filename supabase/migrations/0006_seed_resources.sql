-- =====================================================================
-- 0006_seed_resources.sql — Additional verified apologetics resources.
--
-- SOURCING RULE (see docs/apologetics-research.md): every URL below was
-- verified to resolve to the official owner before being added. No URL is
-- invented. Resources are mapped only to topics they genuinely fit.
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---- New official sources ----------------------------------------------
insert into apologetics_sources (name, slug, website_url, description, official) values
  ('Reasonable Faith', 'reasonable-faith', 'https://www.reasonablefaith.org/',
   'The work of philosopher and theologian Dr. William Lane Craig — arguments for God, the resurrection, and free apologetics training.', true),
  ('Stand to Reason', 'stand-to-reason', 'https://www.str.org/',
   'Greg Koukl''s ministry training Christians to think clearly and engage graciously (Tactics, #STRask).', true),
  ('GotQuestions.org', 'got-questions', 'https://www.gotquestions.org/',
   'Biblically based answers to a very wide range of questions, including an extensive apologetics section.', true),
  ('Reasons to Believe', 'reasons-to-believe', 'https://reasons.org/',
   'Hugh Ross''s ministry exploring the compatibility of science and Christian faith (cosmology, fine-tuning).', true)
on conflict (slug) do nothing;

-- ---- Verified resources -------------------------------------------------
insert into apologetics_resources
  (source_id, title, slug, description, resource_type, url, verified, official, featured)
select s.id, v.title, v.slug, v.description, v.rtype::resource_type, v.url, true, true, v.featured
from (values
  ('reasonable-faith', 'Reasonable Faith — Website',
    'rf-website', 'Articles, Q&A, and free guided apologetics courses from William Lane Craig.',
    'external_resource', 'https://www.reasonablefaith.org/', true),
  ('reasonable-faith', 'Reasonable Faith — YouTube',
    'rf-youtube', 'Lectures, debates, and podcasts from Reasonable Faith.',
    'youtube_channel', 'https://www.youtube.com/user/ReasonableFaithOrg', false),
  ('stand-to-reason', 'Stand to Reason — Website',
    'str-website', 'Greg Koukl''s articles and training on thinking and engaging well.',
    'external_resource', 'https://www.str.org/', false),
  ('stand-to-reason', 'Stand to Reason — Podcasts',
    'str-podcasts', 'The Stand to Reason and #STRask podcasts.',
    'podcast', 'https://www.str.org/podcasts', false),
  ('got-questions', 'GotQuestions.org — Website',
    'gq-website', 'Biblical answers across a huge range of questions and objections.',
    'external_resource', 'https://www.gotquestions.org/', false),
  ('got-questions', 'What Is Christian Apologetics? (GotQuestions)',
    'gq-apologetics', 'A concise introduction to what apologetics is and why it matters.',
    'article', 'https://www.gotquestions.org/Christian-apologetics.html', false),
  ('reasons-to-believe', 'Reasons to Believe — Website',
    'rtb-website', 'Science-and-faith resources on cosmology, fine-tuning, and origins.',
    'external_resource', 'https://reasons.org/', false)
) as v(source_slug, title, slug, description, rtype, url, featured)
join apologetics_sources s on s.slug = v.source_slug
on conflict (slug) do nothing;

-- ---- Map resources to the topics they genuinely address -----------------
insert into resource_topics (resource_id, topic_id)
select r.id, tp.id
from (values
  ('rf-website', 'cosmological-argument'),
  ('rf-website', 'contingency-argument'),
  ('rf-website', 'moral-argument'),
  ('rf-website', 'minimal-facts'),
  ('rf-youtube', 'cosmological-argument'),
  ('rf-youtube', 'minimal-facts'),
  ('str-website', 'who-created-god'),
  ('str-website', 'moral-facts'),
  ('str-podcasts', 'bible-changed'),
  ('str-podcasts', 'who-created-god'),
  ('gq-website', 'who-created-god'),
  ('gq-website', 'bible-changed'),
  ('gq-website', 'copied-from-pagan'),
  ('gq-apologetics', 'argument-from-reason'),
  ('gq-apologetics', 'cosmological-argument'),
  ('rtb-website', 'methodological-naturalism'),
  ('rtb-website', 'physical-constants'),
  ('rtb-website', 'universe-had-a-beginning')
) as m(resource_slug, topic_slug)
join apologetics_resources r on r.slug = m.resource_slug
join apologetics_topics tp on tp.slug = m.topic_slug
on conflict (resource_id, topic_id) do nothing;
