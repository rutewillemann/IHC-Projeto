// logica principal do portal conexao solidaria

(function () {
  "use strict";

  const state = {
    screen: "home",
    category: null,
    userLocation: null, // { lat, lng, label, isGps }
    onlyOpen: false,
    selectedPlaceId: null,
    customMinutes: null, // null = horario real; numero de 0 a 1439 = minutos desde 00:00
    themeIndex: 0 // 0: default, 1: dark, 2: yellow
  };

  const THEMES = [
    { className: "theme-default", label: "Contraste", announce: "Tema padrão claro ativado." },
    { className: "theme-dark", label: "Escuro", announce: "Modo escuro de alto contraste ativado." },
    { className: "theme-yellow", label: "Amarelo", announce: "Modo alto contraste amarelo e preto ativado." }
  ];

  const screens = {
    home: document.getElementById("screen-home"),
    location: document.getElementById("screen-location"),
    results: document.getElementById("screen-results"),
    details: document.getElementById("screen-details")
  };

  const statusLive = document.getElementById("status-live");
  const btnHomeLogo = document.getElementById("btn-home-logo");
  const btnContrast = document.getElementById("btn-contrast");
  const contrastLabel = document.getElementById("contrast-label");

  const customTimeInput = document.getElementById("custom-time-input");
  const btnResetTime = document.getElementById("btn-reset-time");
  const timeStatusHint = document.getElementById("time-status-hint");

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
  const audioFeedback = document.getElementById("audio-feedback");
  const detailAddress = document.getElementById("detail-address");
  const detailReference = document.getElementById("detail-reference");
  const detailHours = document.getElementById("detail-hours");
  const detailServices = document.getElementById("detail-services");
  const detailDocs = document.getElementById("detail-docs");

  let isSpeaking = false;
  let speechKeepAliveTimer = null;

  function announce(message) {
    statusLive.textContent = "";
    window.setTimeout(function () {
      statusLive.textContent = message;
    }, 50);
  }

  function loadPreferences() {
    try {
      const savedTheme = localStorage.getItem("pcs_theme_index");
      if (savedTheme !== null) {
        const parsed = parseInt(savedTheme, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < THEMES.length) {
          state.themeIndex = parsed;
        }
      }
    } catch (e) {
      // ignora erro de armazenamento
    }
    applyTheme();
  }

  function savePreferences() {
    try {
      localStorage.setItem("pcs_theme_index", String(state.themeIndex));
    } catch (e) {
      // ignora erro de armazenamento
    }
  }

  function applyTheme() {
    THEMES.forEach(function (t) {
      document.body.classList.remove(t.className);
    });
    const currentTheme = THEMES[state.themeIndex];
    document.body.classList.add(currentTheme.className);
    contrastLabel.textContent = currentTheme.label;
  }

  // --- audio / leitura em voz alta (compatibilidade mobile + desktop) ---
  function clearSpeechTimer() {
    if (speechKeepAliveTimer !== null) {
      window.clearInterval(speechKeepAliveTimer);
      speechKeepAliveTimer = null;
    }
  }

  function stopSpeech() {
    clearSpeechTimer();
    isSpeaking = false;
    btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignora erro em navegadores restritos
      }
    }
  }

  function setAudioFeedback(msg, isError) {
    if (!msg) {
      audioFeedback.hidden = true;
      audioFeedback.textContent = "";
      return;
    }
    audioFeedback.hidden = false;
    audioFeedback.textContent = msg;
    audioFeedback.classList.toggle("is-error", Boolean(isError));
  }

  function pickPortugueseVoice(voices) {
    if (!voices || !voices.length) return null;
    const ptBr = voices.find(function (v) {
      return v.lang && v.lang.toLowerCase().replace("_", "-") === "pt-br";
    });
    if (ptBr) return ptBr;
    return voices.find(function (v) {
      return v.lang && v.lang.toLowerCase().startsWith("pt");
    }) || null;
  }

  function toggleReadAloud() {
    setAudioFeedback("", false);

    if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance === "undefined") {
      setAudioFeedback("Seu aparelho não suporta leitura por voz neste navegador.", true);
      return;
    }

    if (isSpeaking || window.speechSynthesis.speaking) {
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

    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignora erro inicial
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.96;

    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const chosenVoice = pickPortugueseVoice(voices);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    let started = false;

    utterance.onstart = function () {
      started = true;
      isSpeaking = true;
      btnReadAloudLabel.textContent = "Parar áudio";
      setAudioFeedback("Reproduzindo em voz alta...", false);
    };

    utterance.onend = function () {
      clearSpeechTimer();
      isSpeaking = false;
      btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
      setAudioFeedback("", false);
    };

    utterance.onerror = function (ev) {
      clearSpeechTimer();
      isSpeaking = false;
      btnReadAloudLabel.textContent = "Ouvir informações em voz alta";
      // em alguns celulares android/ios o cancelamento dispara "interrupted" ou "canceled"
      if (ev && (ev.error === "interrupted" || ev.error === "canceled")) {
        setAudioFeedback("", false);
        return;
      }
      setAudioFeedback("Não foi possível tocar o áudio neste celular. Verifique o volume ou a voz em português do aparelho.", true);
    };

    btnReadAloudLabel.textContent = "Parar áudio";
    isSpeaking = true;

    window.setTimeout(function () {
      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        stopSpeech();
        setAudioFeedback("Não foi possível iniciar o áudio neste navegador.", true);
        return;
      }

      // workaround para navegadores moveis que pausam utterances longas
      speechKeepAliveTimer = window.setInterval(function () {
        if (!isSpeaking) {
          clearSpeechTimer();
          return;
        }
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (e) {
          // ignora
        }
      }, 4000);

      // verifica se o dispositivo realmente aceitou a fala apos 1.4s
      window.setTimeout(function () {
        if (isSpeaking && !started && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          stopSpeech();
          setAudioFeedback("A voz em português não respondeu neste celular. Ative a Síntese de Fala (TTS) nas configurações do aparelho.", true);
        }
      }, 1400);
    }, 40);
  }

  // garante carregamento tardio de vozes em chrome / android
  if ("speechSynthesis" in window && typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", function () {
      // vozes atualizadas pelo sistema
    });
  }

  // --- navegacao entre telas ---
  function showScreen(screenName, pushHistory) {
    stopSpeech();
    setAudioFeedback("", false);
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
        // segue normalmente
      }
    }
  }

  // --- distancia e estimativa de rota a pe calibrada para vias urbanas de sp ---
  function calculateStraightKm(lat1, lng1, lat2, lng2) {
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

  // fator urbano de ruas/quadras para aproximar melhor a distancia real de caminhada do maps
  function estimateWalkingKm(straightKm) {
    const roadFactor = straightKm < 0.8 ? 1.22 : (straightKm < 3 ? 1.28 : 1.32);
    return straightKm * roadFactor;
  }

  function formatDistance(walkKm) {
    if (walkKm < 1) {
      const meters = Math.max(50, Math.round((walkKm * 1000) / 10) * 10);
      return "~" + meters + " m a pé";
    }
    return "~" + walkKm.toFixed(1).replace(".", ",") + " km a pé";
  }

  function formatWalkTime(walkKm) {
    // ritmo real de caminhada urbana (~4,5 km/h -> ~13,3 min por km)
    const minutes = Math.max(1, Math.round((walkKm / 4.5) * 60));
    if (minutes < 60) {
      return "~" + minutes + " min";
    }
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    if (rem === 0) {
      return "~" + hours + "h";
    }
    return "~" + hours + "h " + rem + " min";
  }

  function buildMapsWalkingUrl(origin, place) {
    const destination = encodeURIComponent(place.address);
    if (origin && origin.isGps && typeof origin.lat === "number" && typeof origin.lng === "number") {
      return (
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" + origin.lat + "," + origin.lng +
        "&destination=" + destination +
        "&travelmode=walking"
      );
    }
    return (
      "https://www.google.com/maps/dir/?api=1" +
      "&destination=" + destination +
      "&travelmode=walking"
    );
  }

  // --- horario valido (somente numeros de hora 00-23 e minuto 00-59) ---
  function parseValidTimeToMinutes(rawValue) {
    if (!rawValue) return null;
    const cleaned = String(rawValue).replace(/\D/g, "");
    if (cleaned.length !== 4) return null;

    const hh = parseInt(cleaned.slice(0, 2), 10);
    const mm = parseInt(cleaned.slice(2, 4), 10);

    if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      return null;
    }

    return hh * 60 + mm;
  }

  function formatMinutesAsHHMM(totalMinutes) {
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const mm = String(totalMinutes % 60).padStart(2, "0");
    return hh + ":" + mm;
  }

  function getActiveHourAndDay() {
    const now = new Date();
    if (state.customMinutes === null) {
      return {
        hour: now.getHours() + now.getMinutes() / 60,
        day: now.getDay()
      };
    }
    return {
      hour: state.customMinutes / 60,
      day: now.getDay()
    };
  }

  function isPlaceOpen(place) {
    if (place.openHour === 0 && place.closeHour === 24) {
      return true;
    }

    const active = getActiveHourAndDay();
    const dayMatches = place.days.indexOf(active.day) !== -1;
    const hourMatches = active.hour >= place.openHour && active.hour < place.closeHour;
    return dayMatches && hourMatches;
  }

  function applyCustomTimeInput() {
    const raw = customTimeInput.value.trim();

    if (raw === "") {
      state.customMinutes = null;
      customTimeInput.classList.remove("is-invalid");
      timeStatusHint.textContent = "Agora";
      refreshCurrentView();
      return;
    }

    const parsedMinutes = parseValidTimeToMinutes(raw);
    if (parsedMinutes === null) {
      customTimeInput.classList.add("is-invalid");
      timeStatusHint.textContent = "Use 00:00 a 23:59";
      return;
    }

    state.customMinutes = parsedMinutes;
    const formatted = formatMinutesAsHHMM(parsedMinutes);
    customTimeInput.value = formatted;
    customTimeInput.classList.remove("is-invalid");
    timeStatusHint.textContent = "Simulando " + formatted;
    refreshCurrentView();
    announce("Horário ajustado para " + formatted);
  }

  function resetToRealTime() {
    state.customMinutes = null;
    customTimeInput.value = "";
    customTimeInput.classList.remove("is-invalid");
    timeStatusHint.textContent = "Agora";
    refreshCurrentView();
    announce("Voltando para o horário real.");
  }

  function refreshCurrentView() {
    if (state.screen === "results") {
      renderResults();
    } else if (state.screen === "details" && state.selectedPlaceId) {
      openPlaceDetails(state.selectedPlaceId, false);
    }
  }

  // --- fluxo das telas ---
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
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
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
        const straightKm = calculateStraightKm(
          state.userLocation.lat,
          state.userLocation.lng,
          place.lat,
          place.lng
        );
        const walkKm = estimateWalkingKm(straightKm);
        return {
          place: place,
          walkKm: walkKm,
          openNow: isPlaceOpen(place)
        };
      })
      .sort(function (a, b) {
        return a.walkKm - b.walkKm;
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
          '<span>📍 ' + formatDistance(item.walkKm) + '</span>' +
          '<span>· ' + formatWalkTime(item.walkKm) + '</span>' +
        '</div>' +
        '<p class="place-address">' + escapeHtml(item.place.address) + '</p>' +
        '<div class="place-cta">' +
          '<span>Toque para ver telefone, mapa e documentos</span>' +
          '<span aria-hidden="true">→</span>' +
        '</div>';

      card.addEventListener("click", function () {
        openPlaceDetails(item.place.id, true);
      });

      resultsList.appendChild(card);
    });
  }

  function openPlaceDetails(placeId, pushHistory) {
    const place = SUPPORT_PLACES.find(function (p) { return p.id === placeId; });
    if (!place || !state.userLocation) return;

    state.selectedPlaceId = placeId;
    const openNow = isPlaceOpen(place);
    const straightKm = calculateStraightKm(
      state.userLocation.lat,
      state.userLocation.lng,
      place.lat,
      place.lng
    );
    const walkKm = estimateWalkingKm(straightKm);

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

    detailDistance.textContent = "📍 " + formatDistance(walkKm);
    detailWalk.textContent = formatWalkTime(walkKm);

    btnCallNow.href = "tel:" + place.phone;
    detailPhoneDisplay.textContent = place.phoneDisplay + " — toca direto no seu celular";

    btnOpenMaps.href = buildMapsWalkingUrl(state.userLocation, place);

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

    showScreen("details", pushHistory);
    announce("Detalhes de " + place.name + ". " + (openNow ? "Aberto agora." : "Atenção: fechado agora."));
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindEvents() {
    btnHomeLogo.addEventListener("click", function () {
      showScreen("home");
    });

    btnContrast.addEventListener("click", function () {
      state.themeIndex = (state.themeIndex + 1) % THEMES.length;
      applyTheme();
      savePreferences();
      announce(THEMES[state.themeIndex].announce);
    });

    // permite apenas digitos e colon (:) durante a digitacao e formata HH:MM ao sair ou apertar Enter
    customTimeInput.addEventListener("input", function () {
      let digits = customTimeInput.value.replace(/\D/g, "").slice(0, 4);
      if (digits.length > 2) {
        digits = digits.slice(0, 2) + ":" + digits.slice(2);
      }
      customTimeInput.value = digits;
      customTimeInput.classList.remove("is-invalid");

      if (digits === "") {
        state.customMinutes = null;
        timeStatusHint.textContent = "Agora";
        refreshCurrentView();
      } else if (digits.length === 5) {
        applyCustomTimeInput();
      }
    });

    customTimeInput.addEventListener("change", applyCustomTimeInput);
    customTimeInput.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        applyCustomTimeInput();
      }
    });

    btnResetTime.addEventListener("click", resetToRealTime);

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
