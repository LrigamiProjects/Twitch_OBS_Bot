<a id="readme-top"></a>
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<h1 align="center">Title of Project</h1>

<p align="center">
  <a href="http://forthebage.com"><img src="http://forthebadge.com/images/badges/built-with-love.svg" alt="Made with love icon"/></a>
  <a href="http://forthebage.com"><img src="https://forthebadge.com/images/badges/mondays-coffee-1.svg" alt="Mondays coffee icon"/></a>
</p>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#roadmap">Roadmap</a></li>
      </ul>
    </li>
    <li><a href="#get-started">Get Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#launching">Launching</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#versions">Versions</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
    <li><a href="#authors">Authors</a></li>
  </ol>
</details>

## About the Project

**Twitch OBS Bot** est une mini-app Node.js qui permet à un streamer de déclencher des actions dans OBS Studio via des commandes de chat Twitch.  
Ce projet automatise et rend interactif le livestream, sans avoir besoin d’un streamer expérimenté en développement.

Fonctionnalités :
- Connexion automatique à OBS via WebSocket
- Écoute des messages du chat Twitch
- Déclenchement d’événements (ex : changement de scène, activation de source, etc.)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Roadmap

- [x] Connexion à Twitch via @twurple
- [x] Connexion à OBS via obs-websocket-js
- [x] Configuration JSON simple

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Get Started

Voici comment configurer et lancer ce projet sur votre machine locale.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 ou + recommandé)
- [OBS Studio](https://obsproject.com/) avec le plugin **obs-websocket** activé
- Un compte Twitch

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Installation

1. Cloner ce dépôt :

```bash
git clone https://github.com/ton-pseudo/twitch-obs-bot.git
cd twitch-obs-bot
```

2. Installer les dépendances :

```bash 
npm install
```

3. Copier le fichier de configuration 

```bash
cp config.example.json config.json
```

4. Modifier config.json avec vos identifiants Twitch et OBS. 

Pour des raisons de sécurité, évitez de versionner vos données.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Launching

Lancer le projet avec la commande

```bash
npm run start
```

Puis laissez-vous guider par le tutoriel intégré.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built with

- Node.js
- Twurple - pour interagir avec le chat Twitch
- obs-websocket-js - pour contrôler OBS

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Versions

Dernière version stable : 1.0.0
Liste des versions : [Cliquer pour afficher](https://github.com/LrigamiProjects/TTwitch_OBS_Bot/tags)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Ce projet est sous licence Unlicense, vous êtes libre de l'utiliser, modifier ou redistribuer sans restriction.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

- ForTheBadge
- OBS WebSocket
- Twitch Token Generator
- Twurple

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Authors

- THIRY Prune alias @Lrigami

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/prune-thiry-6886a6136/
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
