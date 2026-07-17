export default function Home() {
  return (
    <main className="profile-window">
      <div className="window-title">
        <span>/dev/null</span>
        <span className="window-controls" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
      <div className="profile-content">
        <header className="intro">
          <h1>hola! i&apos;m taha.</h1>
          <p>rising freshman studying cs at penn.</p>

          <p>previously, i&apos;ve:</p>
          <ul>
            <li>
              written embedded software for tethered drones at{" "}
              <a href="https://www.bluevigil.com/">blue vigil</a>
            </li>
            <li>
              built <a href="/isef_poster.pdf">3d printed buoys</a> that track endangered whales 
              (<a href="https://agu.confex.com/agu/osm26/meetingapp.cgi/Paper/2009479/">OSM</a>, {" "}
              <a href="https://isef.net/project/robo046t-mobyglobal-a-real-time-whale-detection-network/">ISEF</a>)
            </li>
            <li>
              made a <a href="">6502</a> breadboard computer with a debugger, i2c, and more
            </li>
            <li>
              programmed <a href="https://github.com/2900xt/neo-OS/">neo-OS</a> from scratch, 
              and designed <a href="https://github.com/2900xt/tahaScript/">tahaScript</a> for it
            </li>
          </ul>

          <p>i also used to do <a href="https://codeforces.com/profile/_ahat">competitive programming</a>.</p>

        </header>

        <section aria-labelledby="writing-heading">
          <h2 id="writing-heading">writing</h2>
          <p>i occasionally <a href="https://substack.com/@taharawjani">rant</a> about life and philosophy :)</p>
        </section>

        <footer>
          <nav aria-label="Elsewhere">
            <a href="https://github.com/2900xt">github</a>
            <a href="https://www.linkedin.com/in/taha-rawjani-08959a2a0/">
              linkedin
            </a>
            <a href="mailto:tahar@engineering.upenn.edu">email</a>
            <a href="/resume.pdf">
              resume
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
