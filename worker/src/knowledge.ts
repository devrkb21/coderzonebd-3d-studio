// The facts the assistants may use, built from the site's own content file at deploy time,
// so prices and services in chat always match what the 3D room shows.
import { COMPANY, CONTACT, COURIER, FAQ, PROCESS, PRODUCTS, SERVICES, STOPS, TECH, WORK, priceText, type L } from '../../src/content'

const both = (l: L) => (l.en === l.bn ? l.en : `${l.en} / ${l.bn}`)

function services() {
  return SERVICES.map((s) => [
    `- id "${s.id}": ${both(s.title)}`,
    `  ${s.desc.en}`,
    `  Includes: ${s.gets.map((g) => g.en).join(', ')}`,
    `  Price: ${priceText(s, 'en')} (${priceText(s, 'bn')})`,
    `  Duration: ${s.duration ? both(s.duration) : 'agreed after discussion'}`,
    s.proof.length ? `  Related projects: ${s.proof.map((id) => WORK.find((w) => w.id === id)?.name ?? id).join(', ')}` : '',
  ].filter(Boolean).join('\n')).join('\n')
}

function products() {
  return PRODUCTS.map((p) => [
    `- ${p.name}: ${p.tagline.en}. ${p.desc.en}`,
    p.features.length ? `  Features: ${p.features.map((f) => f.en).join(', ')}` : '',
    p.tiers.length ? `  Plans: ${p.tiers.map((t) => `${t.name} ${both(t.price)}`).join('; ')}` : '',
    p.note ? `  Offer: ${p.note.en}` : '',
    p.links.length ? `  Links: ${p.links.map((l) => l.url).join(', ')}` : '',
  ].filter(Boolean).join('\n')).join('\n')
}

export const KNOWLEDGE = `# Coder Zone BD — facts you may use

## Company
${COMPANY.name}. ${COMPANY.intro.en}
Headline: ${COMPANY.headline.en}
Why clients choose us:
${COMPANY.why.map((w) => `- ${w.en}`).join('\n')}
Founders: ${COMPANY.team.map((t) => `${t.name} (${t.role})`).join(', ')}.
Stats: ${COMPANY.stats.map((s) => `${s.value} ${s.label.en}`).join('; ')}.

## Contact
Phone: ${CONTACT.phone}
WhatsApp: ${CONTACT.whatsapp}
Email: ${CONTACT.email}
Address: ${both(CONTACT.address)}
Website: ${CONTACT.website}
Client portal: ${CONTACT.portal}

## Services (prices are approximate starting points, final price after a conversation)
${services()}

## Products
${products()}

## Free tool
${COURIER.title.en}: ${COURIER.desc.en} ${COURIER.url}

## Selected work
${WORK.map((w) => `- ${w.name}: ${w.type.en} (${w.stack})${w.url ? ` ${w.url}` : ''}`).join('\n')}

## How we work
${PROCESS.map((p, i) => `${i + 1}. ${p.title.en}: ${p.desc.en}`).join('\n')}

## FAQ
${FAQ.map((f) => `Q: ${f.q.en}\nA: ${f.a.en}`).join('\n')}

## Tech we use
${TECH.join(', ')}

## Sections of this 3D studio (ids for go_to_section)
${STOPS.map((s) => `- "${s.id}": ${both(s.label)}`).join('\n')}
`

export const SERVICE_IDS = SERVICES.map((s) => s.id)
export const STOP_IDS = STOPS.map((s) => s.id)
