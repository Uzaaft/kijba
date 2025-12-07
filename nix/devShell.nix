{
  mkShell,
  alejandra,
  bash,
  nodejs,
  pnpm,
  docker-compose,
}:
mkShell rec {
  name = "kan-i-just-ban-already";

  packages = [
    bash
    nodejs
    pnpm

    docker-compose
  ];
}
