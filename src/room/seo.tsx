/**
 * Entry point for the build-time pre-render (see scripts/prerender.mjs).
 *
 * It renders the same FlatFallback the app uses, so there is exactly one
 * definition of "the CV as readable HTML" — a second copy written just for
 * crawlers would go stale the first time the content changed.
 */
import { FlatFallback } from './RoomPortfolio';
import { PROFILE, SECTIONS, SECTION_ORDER } from './content';

/** `plain` keeps react-router out of the server render entirely. */
export function SeoDocument() {
  return <FlatFallback plain />;
}

/** Per-URL <title> and description, read by the pre-render script. */
export const PAGES = [
  {
    slug: '',
    title: `${PROFILE.name} — ${PROFILE.role}`,
    description:
      'Product manager working on SaaS and fintech platforms in Dhaka. A room you can walk around: every object opens a part of the work.',
  },
  ...SECTION_ORDER.map((id) => ({
    slug: SECTIONS[id].slug,
    title: `${SECTIONS[id].title} — ${PROFILE.name}`,
    description: SECTIONS[id].blurb,
  })),
];

export { PROFILE };
