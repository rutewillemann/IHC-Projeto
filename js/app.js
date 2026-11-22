// logica principal do portal conexao solidaria
// foco em baixo letramento digital, feedback claro e prevencao de erros

(function () {
  "use strict";

  const state = {
    screen: "home",
    category: null,
    userLocation: null, // { lat, lng, label, isGps }
    onlyOpen: false,
    selectedPlaceId: null,
    simulatedHour: "real",
    fontLarge: false,
    themeIndex: 0 // 0: default, 1: dark, 2: yellow
  };

  const THEMES = [
    { className: "theme-default", label: "Contraste", announce: "Tema padrão claro ativado." },
    { className: "theme-dark", label: "Escuro", announce: "Modo escuro de alto contraste ativado." },
    { className: "theme-yellow", label: "Amarelo", announce: "Modo alto contraste amarelo e preto ativado." }
  ];

  // referencias de elementos
  const screens = {
    home: document.getElementById("screen-home"),
    location: document.getElementById("screen-location"),
    results: document.getElementById("screen-results"),
    details: document.getElementById("screen-details")
  };

  const statusLive = document.getElementById("status-live");
  const btnHomeLogo = document.getElementById("btn-home-logo");
  const btnFontSize = document.getElementById("btn-font-size");
  const btnContrast = document.getElementById("btn-contrast");
  const contrastLabel = document.getElementById("contrast-label");
  const timeSimulator = document.getElementById("time-simulator");

  const locSelectedCategory = document.getElementById("loc-selected-category");
  const btnUseGps = document.getElementById("btn-use-gps");
  const gpsFeedback = document.getElementById("gps-feedback");

  const resultsTitle = document.getElementById("results-title");
  const resultsSubtitle = document.getElementById("results-subtitle");
  const resultsCount = document.getElementById("results-count");
  const resultsList = document.getElementById("results-list");
  const resultsEmpty = document.getElementById("results-empty");
  const filterAll = document.getElementById("filter-all");
  const filterOpen = document.getElementById("filter-open");
  const btnShowAllEmpty = document.getElementById("btn-show-all-empty");

  const detailStatusBadge = document.getElementById("detail-status-badge");
  const detailTypeBadge = document.getElementById("detail-type-badge");
  const detailName = document.getElementById("detail-name");
  const detailClosedWarning = document.getElementById("detail-closed-warning");
  const detailClosedText = document.getElementById("detail-closed-text");
  const detailDistance = document.getElementById("detail-distance");
  const detailWalk = document.getElementById("detail-walk");
  const btnCallNow = document.getElementById("btn-call-now");
  const detailPhoneDisplay = document.getElementById("detail-phone-display");
  const btnOpenMaps = document.getElementById("btn-open-maps");
  const btnReadAloud = document.getElementById("btn-read-aloud");
  const btnReadAloudLabel = document.getElementById("btn-read-aloud-label");
  const detailAddress = document.getElementById("detail-address");
  const detailReference = document.getElementById("detail-reference");
  const detailHours = document.getElementById("detail-hours");
  const detailServices = document.getElementById("detail-services");
  const detailDocs = document.getElementById("detail-docs");

  // anuncia mudancas importantes para leitores de tela
  function announce(message) {
    statusLive.textContent = "";
    window.setTimeout(function () {
      statusLive.textContent = message;
    }, 50);
  }

  // carrega preferencias de acessibilidade salvas
  function loadPreferences() {
    try {
      const savedFont = localStorage.getItem("pcs_font_large");
      const savedTheme = localStorage.getItem("pcs_theme_index");
      if (savedFont === "true") {
        state.fontLarge = true;
      }
      if (savedTheme !== null) {
        const parsed = parseInt(savedTheme, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < THEMES.length) {
          state.themeIndex = parsed;
        }
      }
    } catch (e) {
      // ignora erro se o navegador bloquear localstorage
    }
    applyAccessibility();
  }

  function savePreferences() {
    try {
      localStorage.setItem("pcs_font_large", String(state.fontLarge));
      localStorage.setItem("pcs_theme_index", String(state.themeIndex));
    } catch (e) {
      // ignora erro se o navegador bloquear localstorage
    }
  }

  function applyAccessibility() {
    document.body.classList.toggle("font-large", state.fontLarge);
    document.body.classList.toggle("font-normal", !state.fontLarge);
    btnFontSize.setAttribute("aria-pressed", String(state.fontLarge));

    THEMES.forEach(function (t) {
      document.body.classList.remove(t.className);
    });
    const currentTheme = THEMES[state.themeIndex];
    document.body.classList.add(currentTheme.className);
    contrastLabel.textContent = currentTheme.label;
  }

  // interrompe leitura em voz alta se estiver ativa
  function stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
    }
  }

  // troca de tela com foco acessivel no topo
  function showScreen(screenName, pushHistory) {
    stopSpeech();
    state.screen = screenName;

    Object.keys(screens).forEach(function (key) {
      const el = screens[key];
      const isTarget = key === screenName;
      el.hidden = !isTarget;
      el.classList.toggle("screen-active", isTarget);
    });

    window.scrollTo(0, 0);

    if (pushHistory !== false) {
      try {
        history.pushState({ screen: screenName, category: state.category, placeId: state.selectedPlaceId }, "", "#" + screenName);
      } catch (e) {
        // segue normalmente se history api nao estiver disponivel
      }
    }
  }

  // formula de haversine para distancia real em quilometros
  function calculateDistanceKm(lat1, lng1, lat2, lng2) {
    const toRad = function (deg) {
      return (deg * Math.PI) / 180;
    };
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  function formatDistance(km) {
    if (km < 1) {
      const meters = Math.max(50, Math.round((km * 1000) / 10) * 10);
      return meters + " metros de distância";
    }
    return km.toFixed(1).replace(".", ",") + " km de distância";
  }

  function formatWalkTime(km) {
    // velocidade media a pe considerando trajeto urbano (~4 km/h)
    const minutes = Math.max(2, Math.round((km / 4) * 60));
    if (minutes < 60) {
      return "Cerca de " + minutes + " min a pé";
    }
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    if (rem === 0) {
      return "Cerca de " + hours + "h a pé (ou transporte público)";
    }
    return "Cerca de " + hours + "h e " + rem + " min a pé (ou ônibus/metrô)";
  }

  // verifica se o local esta aberto considerando horario real ou simulado
  function isPlaceOpen(place) {
    const now = new Date();
    let hour = now.getHours();
    let day = now.getDay();

    if (state.simulatedHour !== "real") {
      hour = parseInt(state.simulatedHour, 10);
      // na simulacao de apresentacao usa dia util (quarta-feira) para demonstrar abertura
      day = 3;
    }

    if (place.openHour === 0 && place.closeHour === 24) {
      return true;
    }

    const dayMatches = place.days.indexOf(day) !== -1;
    const hourMatches = hour >= place.openHour && hour < place.closeHour;
    return dayMatches && hourMatches;
  }

  // abre a tela de localizacao ou vai direto para os resultados se ja tiver localizacao
  function handleCategorySelect(categoryId) {
    state.category = categoryId;
    state.onlyOpen = false;
    updateFilterButtons();

    const catInfo = CATEGORIES[categoryId];
    locSelectedCategory.textContent = "Ajuda escolhida: " + catInfo.label;

    if (state.userLocation) {
      renderResults();
      showScreen("results");
      announce("Mostrando locais de " + catInfo.label + " perto de " + state.userLocation.label);
    } else {
      gpsFeedback.hidden = true;
      showScreen("location");
      announce("Escolha sua localização para ver locais de " + catInfo.label);
    }
  }

  // solicita geolocalizacao real do dispositivo
  function requestGpsLocation() {
    if (!("geolocation" in navigator)) {
      showGpsError("Seu aparelho não possui localização automática disponível. Escolha sua região na lista abaixo.");
      return;
    }

    btnUseGps.disabled = true;
    gpsFeedback.hidden = false;
    gpsFeedback.textContent = "Buscando onde você está... Se o celular perguntar, toque em Permitir.";

    navigator.geolocation.getCurrentPosition(
      function (position) {
        btnUseGps.disabled = false;
        gpsFeedback.hidden = true;
        state.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "sua localização atual (GPS)",
          isGps: true
        };
        renderResults();
        showScreen("results");
        announce("Localização encontrada. Lista ordenada dos locais mais próximos.");
      },
      function (error) {
        btnUseGps.disabled = false;
        let msg = "Não foi possível pegar o GPS agora. Sem problema: toque na sua região de São Paulo logo abaixo.";
        if (error && error.code === 1) {
          msg = "A permissão de GPS não foi autorizada. Sem problema: escolha sua região de São Paulo abaixo para ver os locais.";
        }
        showGpsError(msg);
      },
      {
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 300000
      }
    );
  }

  function showGpsError(message) {
    gpsFeedback.hidden = false;
    gpsFeedback.textContent = message;
    announce(message);
  }

  function selectManualRegion(regionKey) {
    const region = REGIONS[regionKey];
    if (!region) return;
    state.userLocation = {
      lat: region.lat,
      lng: region.lng,
      label: region.name,
      isGps: false
    };
    renderResults();
    showScreen("results");
    announce("Região selecionada: " + region.name);
  }

  function updateFilterButtons() {
    filterAll.classList.toggle("active", !state.onlyOpen);
    filterAll.setAttribute("aria-pressed", String(!state.onlyOpen));
    filterOpen.classList.toggle("active", state.onlyOpen);
    filterOpen.setAttribute("aria-pressed", String(state.onlyOpen));
  }

  // monta a lista ordenada por proximidade
  function renderResults() {
    if (!state.category || !state.userLocation) return;

    const catInfo = CATEGORIES[state.category];
    resultsTitle.textContent = catInfo.label + " perto de você";
    resultsSubtitle.textContent = "Baseado em " + state.userLocation.label + " (do mais perto ao mais longe).";

    const filtered = SUPPORT_PLACES
      .filter(function (place) {
        return place.categories.indexOf(state.category) !== -1;
      })
      .map(function (place) {
        const dist = calculateDistanceKm(
          state.userLocation.lat,
          state.userLocation.lng,
          place.lat,
          place.lng
        );
        return {
          place: place,
          distanceKm: dist,
          openNow: isPlaceOpen(place)
        };
      })
      .sort(function (a, b) {
        return a.distanceKm - b.distanceKm;
      });

    const visibleItems = state.onlyOpen
      ? filtered.filter(function (item) { return item.openNow; })
      : filtered;

    resultsList.innerHTML = "";

    if (visibleItems.length === 0) {
      resultsCount.textContent = "0 locais abertos neste horário";
      resultsEmpty.hidden = false;
      return;
    }

    resultsEmpty.hidden = true;
    resultsCount.textContent = visibleItems.length === 1
      ? "1 local encontrado"
      : visibleItems.length + " locais encontrados";

    visibleItems.forEach(function (item) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "place-card";
      card.setAttribute("role", "listitem");

      const statusClass = item.openNow ? "status-open" : "status-closed";
      const statusText = item.openNow ? "● ABERTO AGORA" : "● FECHADO AGORA";

      card.innerHTML =
        '<div class="place-top-row">' +
          '<span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
          '<span class="type-badge">' + escapeHtml(item.place.type) + '</span>' +
        '</div>' +
        '<h2 class="place-name">' + escapeHtml(item.place.name) + '</h2>' +
        '<div class="place-distance-row">' +
          '<span>📍 ' + formatDistance(item.distanceKm) + '</span>' +
          '<span>· ' + formatWalkTime(item.distanceKm) + '</span>' +
        '</div>' +
        '<p class="place-address">' + escapeHtml(item.place.address) + '</p>' +
        '<div class="place-cta">' +
          '<span>Toque para ver telefone, mapa e documentos</span>' +
          '<span aria-hidden="true">→</span>' +
        '</div>';

      card.addEventListener("click", function () {
        openPlaceDetails(item.place.id);
      });

      resultsList.appendChild(card);
    });
  }

  // abre a tela de detalhes do ponto selecionado
  function openPlaceDetails(placeId, pushHistory) {
    const place = SUPPORT_PLACES.find(function (p) { return p.id === placeId; });
    if (!place || !state.userLocation) return;

    state.selectedPlaceId = placeId;
    const openNow = isPlaceOpen(place);
    const distKm = calculateDistanceKm(
      state.userLocation.lat,
      state.userLocation.lng,
      place.lat,
      place.lng
    );

    detailStatusBadge.className = "status-badge " + (openNow ? "status-open" : "status-closed");
    detailStatusBadge.textContent = openNow ? "● ABERTO AGORA" : "● FECHADO AGORA";
    detailTypeBadge.textContent = place.type;
    detailName.textContent = place.name;

    if (!openNow) {
      detailClosedWarning.hidden = false;
      detailClosedText.textContent = "Horário de atendimento: " + place.hoursText + ". Ligue antes de ir até o local.";
    } else {
      detailClosedWarning.hidden = true;
    }

    detailDistance.textContent = "📍 " + formatDistance(distKm);
    detailWalk.textContent = formatWalkTime(distKm);

    btnCallNow.href = "tel:" + place.phone;
    detailPhoneDisplay.textContent = place.phoneDisplay + " — toca direto no seu celular";

    const destinationQuery = encodeURIComponent(place.name + ", " + place.address);
    btnOpenMaps.href = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + destinationQuery;

    detailAddress.textContent = place.address;
    detailReference.textContent = "Referência: " + place.reference;
    detailHours.textContent = place.hoursText;

    detailServices.innerHTML = "";
    place.services.forEach(function (srv) {
      const li = document.createElement("li");
      li.textContent = srv;
      detailServices.appendChild(li);
    });

    detailDocs.textContent = place.documents;

    // exibe botao de leitura em voz alta apenas se o navegador suportar
    if ("speechSynthesis" in window) {
      btnReadAloud.hidden = false;
      btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
    } else {
      btnReadAloud.hidden = true;
    }

    showScreen("details", pushHistory);
    announce("Detalhes de " + place.name + ". " + (openNow ? "Aberto agora." : "Atenção: fechado agora."));
  }

  // leitura em voz alta acessivel das informacoes principais do local
  function toggleReadAloud() {
    if (!("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking) {
      stopSpeech();
      return;
    }
    const place = SUPPORT_PLACES.find(function (p) { return p.id === state.selectedPlaceId; });
    if (!place) return;

    const openStatus = isPlaceOpen(place) ? "Este local está aberto agora." : "Atenção: este local está fechado agora.";
    const text =
      place.name + ". " +
      openStatus + " " +
      "Endereço: " + place.address + ". " +
      "Horário: " + place.hoursText + ". " +
      "Documentos: " + place.documents;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.onend = function () {
      btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
    };
    utterance.onerror = function () {
      btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
    };

    btnReadAloudLabel.textContent = "Parar leitura em voz alta";
    window.speechSynthesis.speak(utterance);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // vincula eventos de interface
  function bindEvents() {
    btnHomeLogo.addEventListener("click", function () {
      showScreen("home");
    });

    btnFontSize.addEventListener("click", function () {
      state.fontLarge = !state.fontLarge;
      applyAccessibility();
      savePreferences();
      announce(state.fontLarge ? "Tamanho da letra aumentado." : "Tamanho da letra padrão.");
    });

    btnContrast.addEventListener("click", function () {
      state.themeIndex = (state.themeIndex + 1) % THEMES.length;
      applyAccessibility();
      savePreferences();
      announce(THEMES[state.themeIndex].announce);
    });

    document.querySelectorAll(".cat-card").forEach(function (card) {
      card.addEventListener("click", function () {
        const cat = card.getAttribute("data-category");
        handleCategorySelect(cat);
      });
    });

    btnUseGps.addEventListener("click", requestGpsLocation);

    document.querySelectorAll(".btn-region").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectManualRegion(btn.getAttribute("data-region"));
      });
    });

    document.querySelectorAll("[data-action='go-home']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showScreen("home");
      });
    });

    document.querySelectorAll("[data-action='change-location']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        gpsFeedback.hidden = true;
        showScreen("location");
      });
    });

    document.querySelectorAll("[data-action='go-results']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        renderResults();
        showScreen("results");
      });
    });

    filterAll.addEventListener("click", function () {
      state.onlyOpen = false;
      updateFilterButtons();
      renderResults();
    });

    filterOpen.addEventListener("click", function () {
      state.onlyOpen = true;
      updateFilterButtons();
      renderResults();
    });

    btnShowAllEmpty.addEventListener("click", function () {
      state.onlyOpen = false;
      updateFilterButtons();
      renderResults();
    });

    btnReadAloud.addEventListener("click", toggleReadAloud);

    timeSimulator.addEventListener("change", function () {
      state.simulatedHour = timeSimulator.value;
      if (state.screen === "results") {
        renderResults();
      } else if (state.screen === "details" && state.selectedPlaceId) {
        openPlaceDetails(state.selectedPlaceId, false);
      }
      announce("Horário de simulação atualizado.");
    });

    // suporte ao botao voltar nativo do celular e navegador
    window.addEventListener("popstate", function (event) {
      if (event.state && event.state.screen) {
        const target = event.state.screen;
        if (target === "results" && state.category && state.userLocation) {
          renderResults();
          showScreen("results", false);
        } else if (target === "details" && state.selectedPlaceId) {
          openPlaceDetails(state.selectedPlaceId, false);
        } else if (target === "location" && state.category) {
          showScreen("location", false);
        } else {
          showScreen("home", false);
        }
      } else {
        showScreen("home", false);
      }
    });
  }

  loadPreferences();
  bindEvents();
})();
