FROM node:latest

# Environment variables
ENV DEBIAN_FRONTEND noninteractive
ENV HUBOT_NAME myhubot
ENV HUBOT_OWNER jt
ENV HUBOT_DESCRIPTION Hubot

RUN useradd hubot -m

RUN npm install -g hubot coffee-script yo generator-hubot

# Install the latest version of Firefox:
RUN export DEBIAN_FRONTEND=noninteractive \
  && apt-get update \
  && apt-get install --no-install-recommends --no-install-suggests -y \
    # Firefox dependencies:
    libgtk-3-0 \
    libdbus-glib-1-2 \
    bzip2 \
  && DL='https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64' \
  && curl -sL "$DL" | tar -xj -C /opt \
  && ln -s /opt/firefox/firefox /usr/local/bin/ \
  # Remove obsolete files:
  && apt-get autoremove --purge -y \
    bzip2 \
  && apt-get clean \
  && rm -rf \
    /tmp/* \
    /usr/share/doc/* \
    /var/cache/* \
    /var/lib/apt/lists/* \
    /var/tmp/*

# Install the latest version of Geckodriver:
RUN BASE_URL=https://github.com/mozilla/geckodriver/releases/download \
  && VERSION=$(curl -sL \
    https://api.github.com/repos/mozilla/geckodriver/releases/latest | \
    grep tag_name | cut -d '"' -f 4) \
  && curl -sL "$BASE_URL/$VERSION/geckodriver-$VERSION-linux64.tar.gz" | \
    tar -xz -C /usr/local/bin


USER hubot

WORKDIR /home/hubot

RUN yo hubot --owner="${HUBOT_OWNER}" --name="${HUBOT_NAME}" --description="${HUBOT_DESCRIPTION}" --defaults && sed -i /heroku/d ./external-scripts.json && sed -i /redis-brain/d ./external-scripts.json && npm install hubot-scripts && npm install hubot-slack --save && npm install rabbit.js --save && npm install request --save && npm install --save fs && npm install cheerio --save && npm install cron --save && npm install underscore && npm install mongodb && npm install slackbots --save && npm install jenkins-api --save && npm install selenium-webdriver --save && npm install --save imgur
#setting the external-scripts on the line17↑

VOLUME ["/home/hubot/scripts"]

CMD bin/hubot -n $HUBOT_NAME --adapter slack