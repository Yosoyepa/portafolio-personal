import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/lib/content.ts';
import { profileSources, retrieveProfile } from '../src/lib/retrieval.ts';

for (const lang of ['es', 'en']) {
  const sources = profileSources(content[lang]);
  test(`${lang}: all answers quote public source passages and valid section anchors`, () => {
    for (const query of ['AWS', 'Bedrock', 'RAG', 'cloud producción', 'agents observability', 'CodeGuardAI', 'Inetum', 'Write Check Trust', 'SKIP LOCKED', 'OCR']) {
      const results = retrieveProfile(query, sources);
      assert.ok(results.length > 0, query);
      assert.ok(results.length <= 3);
      for (const result of results) {
        const original = sources.find(source => source.id === result.id);
        assert.ok(original);
        assert.ok(result.passages.every(passage => original.passages.includes(passage)));
        assert.ok(/^#(experiencia|proyectos|perfil|stack|certificaciones)$/.test(result.href));
      }
    }
  });
  test(`${lang}: specific queries retrieve the relevant project and role`, () => {
    assert.equal(retrieveProfile('CodeGuardAI', sources)[0].title, 'CodeGuardAI');
    assert.equal(retrieveProfile('Inetum', sources)[0].title, 'Inetum Colombia S.A.S');
    assert.ok(retrieveProfile('RAG', sources).some(source => source.passages.some(p => /RAG/i.test(p))));
  });
  test(`${lang}: unsupported topics, stopwords and empty inputs do not invent answers`, () => {
    for (const query of ['', '   ', '?!', 'de la que', 'quantum cryptography', 'salario remuneración', '<script>alert(1)</script>']) {
      assert.deepEqual(retrieveProfile(query, sources), [], query);
    }
  });
  test(`${lang}: diacritics are normalized and short tokens do not match substrings`, () => {
    assert.deepEqual(retrieveProfile('producción', sources), retrieveProfile('produccion', sources));
    const ai = retrieveProfile('AI', sources);
    assert.ok(ai.length > 0);
    assert.deepEqual(retrieveProfile('AI', [{ id: 'unrelated', title: 'Plain details', meta: '', passages: ['A maintenance routine'], href: '#perfil' }]), []);
  });
  test(`${lang}: generic career and project questions have useful sources`, () => {
    assert.equal(retrieveProfile(lang === 'es' ? '¿Qué experiencia tienes?' : 'What experience do you have?', sources).length, 3);
    assert.equal(retrieveProfile(lang === 'es' ? 'proyectos' : 'projects', sources).length, 3);
  });
  test(`${lang}: queries retrieve new public cases and preserve scope`, () => {
    assert.equal(retrieveProfile('Write Check Trust', sources)[0].title, 'Write, Check, Trust');
    assert.equal(retrieveProfile('SKIP LOCKED', sources)[0].title, 'Personal Assistant');
    assert.equal(retrieveProfile('OCR', sources)[0].title, 'Inetum Colombia S.A.S');
    const original = JSON.stringify(sources);
    const first = retrieveProfile('Personal Assistant', sources);
    assert.deepEqual(retrieveProfile('Personal Assistant', sources), first);
    assert.equal(JSON.stringify(sources), original, 'search must not mutate subsequent answers');
  });
}

test('both languages preserve the same credentials and all three career stages', () => {
  assert.equal(content.es.certs.groups.flatMap(g => g.items).length, 12);
  assert.equal(content.en.certs.groups.flatMap(g => g.items).length, 12);
  assert.equal(content.es.experience.jobs.length, 3);
  assert.equal(content.en.experience.jobs.length, 3);
});

test('the curated projects retain their identities, repo links and maturity in both languages', () => {
  const es = content.es.projects.items;
  const en = content.en.projects.items;
  assert.equal(es.length, 6);
  assert.deepEqual(es.map(p => p.id), en.map(p => p.id));
  assert.equal(new Set(es.map(p => p.id)).size, 6);
  for (const [index, project] of es.entries()) {
    assert.match(project.link, /^https:\/\/github\.com\/Yosoyepa\/[^/]+$/);
    assert.equal(project.link, en[index].link);
    assert.deepEqual(project.tech, en[index].tech);
    assert.ok(project.details.length >= 2);
    assert.ok(project.status.length > 0 && en[index].status.length > 0);
  }
  assert.match(es.find(p => p.id === 'wct').status, /Beta/);
  assert.match(es.find(p => p.id === 'assistant').status, /Alpha/);
  assert.equal(es.find(p => p.id === 'oracle').link, 'https://github.com/Yosoyepa/secret-oracle-hackathon-aws');
});
