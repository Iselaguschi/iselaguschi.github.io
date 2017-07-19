/**
 * Created by EWEUser on 18.07.2017.
 */

(function() {
    'use strict';

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedAccounts: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
    };

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function () {
        // Refresh all of the forecasts
        app.updateFinances();
    });

    document.getElementById('butAdd').addEventListener('click', function () {
        // Open/show the add new city dialog
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function () {
        // Add the newly created Account
        var name = document.getElementById('fk-account-name-input');
        // var select = document.getElementById('selectCityToAdd');
        // var selected = select.options[select.selectedIndex];
        var key = app.selectedAccounts.length + 1;
        var label = name.value;
        if (!app.selectedAccounts) {
            app.selectedAccounts = [];
        }
        app.selectedAccounts.push({key: key, label: label});
        var data = JSON.stringify(app.selectedAccounts[key-1]);
        console.log("data:" + data);
        app.updateForecastCard(data);
        app.saveSelectedAccounts();
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', function () {
        // Close the add new city dialog
        app.toggleAddDialog(false);
    });

    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Toggles the visibility of the add new city dialog.
    app.toggleAddDialog = function (visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Updates a weather card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.
    app.updateForecastCard = function (data) {
        var dataLastUpdated = new Date(data.created);
        var accountName = data.label;
        var accountKey = data.key;

        var card = app.visibleCards[data.key];
        if (!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.account-name').textContent = data.label;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.key] = card;
        }

        // // Verifies the data provide is newer than what's already visible
        // // on the card, if it's not bail, if it is, continue and update the
        // // time saved in the card
        var cardLastUpdatedElem = card.querySelector('.card-last-updated');
        var cardLastUpdated = cardLastUpdatedElem.textContent;
        if (cardLastUpdated) {
            cardLastUpdated = new Date(cardLastUpdated);
            // Bail if the card has more recent data then the data
            if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
                return;
            }
        }
        cardLastUpdatedElem.textContent = data.created;

        // card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
        // card.querySelector('.current .temperature .value').textContent =
        //     Math.round(current.temp);
        card.querySelector('.account-name').textContent = accountName;
        card.querySelector('.account-key').textContent = accountKey;

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /*****************************************************************************
     *
     * Functions to fetch and store the data
     *
     ****************************************************************************/

    // Save list of cities to localStorage.
    app.saveSelectedAccounts = function () {
        var selectedAccounts = JSON.stringify(app.selectedAccounts);
        localStorage.selectedAccounts = selectedAccounts;
    };

    app.updateFinances = function() {
        app.getAccountData();
    }

    app.getAccountData = function() {
        console.log("refresh");
        app.selectedAccounts = localStorage.selectedAccounts;
        if (app.selectedAccounts) {
            app.selectedAccounts = JSON.parse(app.selectedAccounts);
            app.selectedAccounts.forEach(function (account) {
                app.updateForecastCard(account);
            });
        } else {
            /* The user is using the app for the first time, or the user has not
             * saved any cities, so show the user some fake data. A real app in this
             * scenario could guess the user's location via IP lookup and then inject
             * that data into the page.
             */
            app.updateForecastCard(initialAccountData);
            app.selectedAccounts = [
                {key: initialAccountData.key, label: initialAccountData.label}
            ];
            app.saveSelectedAccounts();
        }
    };

    // TODO toggleAddDialog(bool)

    /*
     * Fake weather data that is presented when the user first uses the app,
     * or when the user has not saved any cities. See startup code for more
     * discussion.
     */
    var initialAccountData = {
        key: '1',
        label: 'test',
    };


    /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/

    app.getAccountData();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() { console.log('Service Worker Registered'); });
    }


})();