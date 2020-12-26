document.addEventListener("DOMContentLoaded", function() {
  document.addEventListener('click', function(event){
    if (event.target && event.target.classList.contains('cashflowcalc-btn')){
      window.open(event.target.getAttribute('data-url'), '_blank');
    }
  });
  
  if (window.location.hostname.includes("zillow")) {
    let propertiesParent = document.getElementById("grid-search-results");
    if (propertiesParent === null) {
      return;
    }

    for (let card of propertiesParent.querySelectorAll("article.list-card")) {
      cashflowcalcCreateBtn("zillow", card, ".list-card-price", "address.list-card-addr", ".list-card-details > li", "zillow-main");
    }
    let mainMutationCallback = function(mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll("article.list-card")) {
              cashflowcalcCreateBtn("zillow", card, ".list-card-price", "address.list-card-addr", ".list-card-details > li", "zillow-main");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(propertiesParent, { attributes : false, childList : true, subtree : true });
    
    let detailsPopup = document.getElementById("home-detail-lightbox-container");
    if (detailsPopup !== null) {
      let detailsMutationCallback = function(mutations) {
        if (mutations[0].addedNodes.length > 0) {
          cashflowcalcCreateBtn(
            "zillow",
            detailsPopup.querySelector("#details-page-container .ds-home-details-chip"),
            ".ds-summary-row h4",
            ".ds-price-change-address-row h1",
            ".ds-summary-row .h3 > span, .ds-summary-row h3 > button",
            "zillow-big"
          );
        }
      };
      let detailsObserver = new MutationObserver(detailsMutationCallback);
      detailsObserver.observe(detailsPopup, { attributes : false, childList : true, subtree : true });
    } 
  }
  
  else if (window.location.hostname.includes("trulia")) {
    for (let card of document.querySelectorAll("[data-testid='home-card-sale']")) {
      cashflowcalcCreateBtn("trulia", card, "[data-testid='property-price']", "[data-testid='property-street'], [data-testid='property-region']", "[r='xxs']");
    }
    let mainMutationCallback = function(mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains("cashflowcalc-btn")) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll("[data-testid='home-card-sale']")) {
              cashflowcalcCreateBtn("trulia", card, "[data-testid='property-price']", "address.list-card-addr", "[r='xxs']");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, { attributes : false, childList : true, subtree : true });
    
    let standalonePage = document.querySelector("[data-testid='home-details-summary-container']");
    if (standalonePage !== null) {
      cashflowcalcCreateBtn(
        "trulia",
        standalonePage,
        "[data-testid='on-market-price-details']",
        "[data-testid='home-details-summary-headline'], [data-testid='home-details-summary-city-state']",
        "[data-testid='facts-list'] > li",
        "trulia-big"
      );
    }
  }
  
  else if (window.location.hostname.includes("redfin")) {
    for (let card of document.querySelectorAll(".HomeCard .bottomV2")) {
      cashflowcalcCreateBtn("redfin", card, ".homecardV2Price", ".homeAddressV2", ".HomeStatsV2 > .stats", "redfin-main");
    }
    let mainMutationCallback = function(mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains("cashflowcalc-btn")) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(".HomeCard .bottomV2, .SimilarHomeCardReact .bottomV2")) {
              cashflowcalcCreateBtn("redfin", card, ".homecardV2Price", ".homeAddressV2", ".HomeStatsV2 > .stats", "redfin-main");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, { attributes : false, childList : true, subtree : true });

    let standalonePage = document.querySelector(".HomeInfo");
    if (standalonePage !== null) {
      cashflowcalcCreateBtn(
        "redfin",
        standalonePage,
        ".price",
        ".address",
        ".HomeMainStats .info-block",
        "redfin-big"
      );
    }
  }
});

// Keep only digits and period
cashflowcalcParseNum = function(el) {
  let str = el.textContent.trim().replace(/[^.\d]/g, "");
  
  if (el.textContent.trim().endsWith("K")) {
    str += "000";
  }
  
  let num = parseFloat(str);
  if (isNaN(num)) {
    return -1;
  } else {
    return num;
  }
}

cashflowcalcCreateBtn = function(website, card, priceSel, addressSel, detailsSel, extra = "") {
  if (card === null) {
    return;
  }

  if (card.querySelector("a.cashflowcalc-btn") !== null) {
    return;
  }

  let price = card.querySelector(priceSel);
  if (price === null) {
    return;
  }
  price = cashflowcalcParseNum(price);
  if (price < 10000) {
    return;
  }

  let btn = document.createElement("a");
  btn.innerHTML = "Analyze Cashflow 📈";
  btn.classList.add("cashflowcalc-btn");
  btn.classList.add(`cashflowcalc-${website}`);
  if (extra != "") {
    btn.classList.add(`cashflowcalc-${extra}`);
  }
  let url = "https://cashflowcalc.com/";
  url += `?prefill=${website}`;

  url += `&price=${price}`;

  let addresses = card.querySelectorAll(addressSel);
  let addressString = '';
  for (address of addresses) {
    addressString += ' ' + address.textContent.trim();
  }
  addressString = addressString.replace(/#/g, "").trim();
  if (addressString !== '') {
    url += `&address=${addressString}`;    
  }

  let details = card.querySelectorAll(detailsSel);
  for (let detail of details) {
    if (detail.textContent.trim().endsWith("bds") || detail.textContent.trim().endsWith("bd") || detail.textContent.trim().endsWith("Beds") || detail.textContent.trim().endsWith("Bed")) {
      let beds = cashflowcalcParseNum(detail);
      if (beds > 0) {
        url += `&beds=${beds}`;
      }
    }
    if (detail.textContent.trim().endsWith("ba") || detail.textContent.trim().endsWith("Baths") || detail.textContent.trim().endsWith("Bath")) {
      let baths = cashflowcalcParseNum(detail);
      if (baths > 0) {
        url += `&baths=${baths}`;
      }
    }
    if (detail.textContent.trim().endsWith("sqft") || detail.textContent.trim().endsWith("Sq. Ft.")) {
      let sqft = cashflowcalcParseNum(detail);
      if (sqft > 0) {
        url += `&sqft=${sqft}`;
      }
    }
  }

  btn.setAttribute('data-url', encodeURI(url));
  card.appendChild(btn);
}