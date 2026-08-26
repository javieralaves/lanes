import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="poster-page">
      <div className="poster-grain" aria-hidden />
      <div className="poster-wall" aria-hidden />

      <header className="poster-hero">
        <div className="hero-bill">
          <span className="hero-bill-tape hero-bill-tape-l" aria-hidden />
          <span className="hero-bill-tape hero-bill-tape-r" aria-hidden />
          <p className="poster-stamp">Kitchen arcade · Street paste</p>
          <h1 className="poster-brand">
            <span className="poster-brand-word">LANES</span>
          </h1>
          <p className="poster-headline">Cook along a recipe like a song.</p>
          <p className="poster-lede">
            Timed prep streams. Hit each step when it arrives. Dinner stops
            feeling like a document.
          </p>
          <div className="poster-cta-row">
            <Link href="/play" className="poster-cta">
              Play the demo
            </Link>
          </div>
        </div>
      </header>

      <main className="poster-stack">
        <section className="flyer flyer-problem" aria-labelledby="problem-title">
          <span className="flyer-tape" aria-hidden />
          <p className="flyer-kicker">01 · The problem</p>
          <h2 id="problem-title" className="flyer-title">
            Dinner eats an hour. The recipe just sits there.
          </h2>
          <p className="flyer-body">
            A written recipe is a list, not a sequence you can play. You chop,
            glance back, lose the boil, re-read the next line. The clock runs;
            the page doesn&apos;t.
          </p>
        </section>

        <section className="flyer flyer-who" aria-labelledby="who-title">
          <span className="flyer-staple" aria-hidden />
          <p className="flyer-kicker">02 · Who it&apos;s for</p>
          <h2 id="who-title" className="flyer-title">
            Home cooks at the counter.
          </h2>
          <p className="flyer-body">
            Built for Javier-types: weeknight cooks who want rhythm, not another
            meal-kit app. One plate. Real steps. Hands on the board while the
            pot talks back.
          </p>
        </section>

        <section className="flyer flyer-how" aria-labelledby="how-title">
          <span className="flyer-tape flyer-tape-skew" aria-hidden />
          <p className="flyer-kicker">03 · How it works</p>
          <h2 id="how-title" className="flyer-title">
            Recipe → parallel lanes → hit the step.
          </h2>
          <ol className="flyer-steps">
            <li>
              <strong>Load a recipe</strong>
              <span>Steps become notes on a timeline.</span>
            </li>
            <li>
              <strong>Split into lanes</strong>
              <span>Board, Pot, Finish run in parallel—like prep stations.</span>
            </li>
            <li>
              <strong>Strike on time</strong>
              <span>When a step reaches the line, you hit it. Cook moves on.</span>
            </li>
          </ol>
        </section>

        <section className="flyer flyer-proof" aria-labelledby="proof-title">
          <p className="flyer-kicker">04 · Proof</p>
          <h2 id="proof-title" className="flyer-title">
            Weeknight lentil curry.
          </h2>
          <p className="flyer-body">
            The playable demo is one real dish compressed into ~2.5 minutes of
            play: dice onion, bloom cumin, tip lentils, splash coconut, plate.
            No fake quotes—just the cook you can run.
          </p>
          <ul className="flyer-notes" aria-label="Sample steps from the demo">
            <li>Dice onion</li>
            <li>Bloom cumin</li>
            <li>Tip lentils</li>
            <li>Splash coconut</li>
            <li>Plate &amp; serve</li>
          </ul>
        </section>

        <section className="flyer flyer-end" aria-labelledby="cta-title">
          <p className="flyer-kicker">05 · Your move</p>
          <h2 id="cta-title" className="flyer-title">
            Put the recipe on lanes.
          </h2>
          <p className="flyer-body">
            Open the cabinet. Start cook. Hit Board · Pot · Finish as the notes
            arrive.
          </p>
          <Link href="/play" className="poster-cta poster-cta-end">
            Play the demo
          </Link>
        </section>
      </main>

      <footer className="poster-foot">
        <span className="poster-foot-brand">LANES</span>
        <span className="poster-foot-sep" aria-hidden>
          /
        </span>
        <span>Arcade cook · Javier&apos;s counter</span>
      </footer>
    </div>
  );
}
