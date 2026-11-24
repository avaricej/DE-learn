const search = document.querySelector('#search');
const section = document.querySelector('#section');
const status = document.querySelector('#status');
const results = document.querySelector('#cards');
const modes = document.querySelectorAll('input[name="mode"]');

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function disclosure(label, text, tag = 'p') {
  const details = document.createElement('details');
  details.append(element('summary', label), element(tag, text));
  return details;
}

function renderCard(card, quiz) {
  const article = document.createElement('article');
  article.append(element('h2', card.title));

  if (quiz) {
    article.append(
      element('h3', 'Вопрос'),
      element('p', card.question),
      disclosure('Показать подсказку', card.hint),
      disclosure('Показать ответ', card.answer),
    );
  } else {
    const summary = document.createElement('ul');
    for (const line of card.summary) {
      summary.append(element('li', line));
    }
    article.append(element('h3', 'Суть'), summary);

    if (card.takeaway) {
      const takeaway = element('p', '');
      const emphasis = element('strong', card.takeaway);
      emphasis.className = 'takeaway';
      takeaway.append(emphasis);
      article.append(element('h3', 'Главное различие'), takeaway);
    }

    const example = element('p', card.example);
    example.className = 'example';
    article.append(element('h3', 'Пример'), example);

    if (card.diagram) {
      article.append(element('h3', 'Схема'), element('p', card.diagram));
    }
  }

  if (card.practice) {
    const { dialect, example, question, hint, answer } = card.practice;
    article.append(element('h3', (quiz ? 'Практика · ' : 'SQL · ') + dialect));
    if (quiz) {
      article.append(
        element('p', question),
        disclosure('Подсказка к практике', hint),
        disclosure('Ответ на практику', answer, 'pre'),
      );
    } else {
      article.append(element('pre', example));
    }
  }

  const sources = document.createElement('ul');
  for (const source of card.sources) {
    const item = document.createElement('li');
    const label = source.section + ' — ' + source.title;
    if (source.url) {
      const link = element('a', label);
      link.href = source.url;
      item.append(link);
    } else {
      item.textContent = label;
    }
    sources.append(item);
  }
  article.append(element('h3', 'Источники'), sources);
  return article;
}

async function start() {
  const response = await fetch('./cards.json');
  if (!response.ok) throw new Error('Не удалось загрузить карточки');
  const cards = await response.json();

  function render() {
    const query = search.value.trim().toLocaleLowerCase('ru');
    const quiz = document.querySelector('input[name="mode"]:checked').value === 'quiz';
    const matches = cards.filter(card => {
      const terms = [card.title, ...card.terms].join(' ').toLocaleLowerCase('ru');
      return terms.includes(query) &&
        (!section.value || card.sources.some(source => source.section === section.value));
    });
    status.textContent = matches.length ? '' : 'В этом разделе ничего не найдено.';
    results.replaceChildren(...matches.map(card => renderCard(card, quiz)));
  }

  search.addEventListener('input', render);
  section.addEventListener('change', render);
  for (const mode of modes) mode.addEventListener('change', render);
  render();
}

start().catch(() => {
  status.textContent = 'Не удалось загрузить карточки. Обнови страницу или проверь, запущен ли сервер.';
});
