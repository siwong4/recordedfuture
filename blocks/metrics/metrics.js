/**
 * loads and decorates the metrics block
 * @param {Element} block The metrics block element
 */

const parseAndExtract = (statValue) => {
  const match = statValue.match(/^([^0-9]?)([\d.,]+)([^0-9.,]*)$/);
  return {
    input: match ? match[0] : '',
    prefix: match ? match[1] || '' : '',
    number: match ? parseFloat(match[2].replace(/,/g, '')) : NaN,
    unit: match ? match[3] || '' : '',
  };
};

const decorateStat = (statLabel, statValue, statsWrapper) => {
  const stat = document.createElement('div');
  const { prefix, number, unit } = parseAndExtract(statValue);

  const value = document.createElement('p');
  value.classList.add('stat-value', 'count');
  value.setAttribute('data-target', isNaN(number) ? statValue : prefix + number);
  value.setAttribute('data-unit', unit);

  value.innerText = '0';
  const unitSpan = document.createElement('span');
  unitSpan.innerText = unit;
  value.append(unitSpan);

  const label = document.createElement('p');
  label.classList.add('stat-label');
  label.innerText = statLabel;

  stat.append(value, label);
  statsWrapper.append(stat);
};

export default async function decorate(block) {
  const { href } = block.querySelector('a');
  const resp = await fetch(href);
  const { data } = await resp.json();
  const [infoData, statsData] = data;

  // info block
  const { heading, description } = infoData;
  const infoWrapper = document.createElement('div');
  infoWrapper.classList.add('metrics-info-wrapper');

  const title = document.createElement('h2');
  title.classList.add('metrics-title');
  title.innerText = heading;

  const desc = document.createElement('p');
  desc.classList.add('metrics-description');
  desc.innerText = description;

  infoWrapper.append(title, desc);

  // stats block
  const statsWrapper = document.createElement('div');
  statsWrapper.classList.add('metrics-stats-wrapper');

  const singleStatLabel = block.closest('[data-stat]')?.getAttribute('data-stat');
  const statData = Object.values(statsData)
    .find((stat) => stat.toLowerCase().includes(singleStatLabel))
    ?.split('\n');

  if (singleStatLabel && statData) {
    const [statLabel, statValue] = statData;
    decorateStat(statLabel, statValue, statsWrapper);
  } else {
    const stats = Object.values(statsData).reduce((acc, stat) => {
      if (stat) {
        const [label, value] = stat.split('\n');
        acc.push({ label, value });
      }
      return acc;
    }, []);

    stats.forEach((s) => {
      decorateStat(s.label, s.value, statsWrapper);
    });
  }

  block.innerHTML = '';
  block.append(infoWrapper, statsWrapper);

  const counters = block.querySelectorAll(':scope .count');
  const speed = 20;

  // stats counter
  const statCounters = () => {
    counters.forEach((counter) => {
      let count = 0;
      const unit = counter.getAttribute('data-unit') || '';
      const targetString = counter.getAttribute('data-target');
      const strippedTarget = targetString.replace(/,/g, '');

      const match = strippedTarget.match(/^([^0-9]*)(\d[\d.]*)$/);

      if (!match) {
        counter.innerText = targetString + unit;
        return;
      }

      const prefix = match[1] || '';
      const target = parseFloat(match[2]);
      const increment = Math.ceil(target / speed);

      if (isNaN(target)) {
        counter.innerText = targetString + unit;
        return;
      }

      const updateCount = () => {
        if (count < target) {
          count += increment;
          if (count > target) count = target;
          counter.innerText = `${prefix}${count.toLocaleString()}${unit}`;
          setTimeout(updateCount, 40);
        } else {
          counter.innerText = `${prefix}${target.toLocaleString()}${unit}`;
        }
      };

      updateCount();
    });
  };

  // observe if stats are in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', statCounters, {
          once: true,
        });
      }
    });
  });

  observer.observe(block.querySelector(':scope .metrics-stats-wrapper'));
}
