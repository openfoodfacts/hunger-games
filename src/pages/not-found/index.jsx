import * as React from "react";
import styles from '../../styles/notFound.module.css'

export default function Insights() {
  return (
    <center>
      <img src={require("../../assets/404.png")} className={styles.logo} />
      <h1 className={styles.text}>
        Whoops! The page you're looking for can't be found.
      </h1>
      <p className={styles.redirect}>
        Want to play some games? <a href="/logos">Click here</a>
      </p>
    </center>
  );
}
