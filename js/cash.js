class CashManager {
    constructor() {
        this.to_paid = 0;
        this.cashbox_item = [0.1, 0.1, 0.2, 0.5, 1, 2, 5, 20, 50, 50, 10, 100, 200].sort((a, b) => b - a);
        this.cashbox_value = 138.9;
        this.new_cashbox_item = [];
        this.cash_given_value = 0;
        this.cash_given_items = [];
    }

    create_cash(id, value) {
        let style = ""

        if (value >= 5) {
            style = "width:80px";
        } else {
            style = "width:40px;"
        }
        let id_buffer = value.toString().replace(".", "_");
        let img_link = "img/euros/cash_" + id_buffer + ".png";
        let link = `cashmanager.remove_cash(this,${value},'${id}')`;
        let html_text = `<img style="${style}" onclick="${link}" src="${img_link}">`;
        //console.log(id + "_" + id_buffer + "_box");

        document.getElementById(id + "_" + id_buffer + "_box").innerHTML += html_text;
    }

    fill_cash(item, current_cash) {
        console.log("Get Element:" + item);
        console.log(current_cash);

        //console.log(element);
        document.getElementById(item + "_0_1_box").innerHTML = "";
        document.getElementById(item + "_0_2_box").innerHTML = "";
        document.getElementById(item + "_0_5_box").innerHTML = "";
        document.getElementById(item + "_1_box").innerHTML = "";
        document.getElementById(item + "_2_box").innerHTML = "";
        document.getElementById(item + "_5_box").innerHTML = "";
        document.getElementById(item + "_10_box").innerHTML = "";
        document.getElementById(item + "_20_box").innerHTML = "";
        document.getElementById(item + "_50_box").innerHTML = "";
        document.getElementById(item + "_100_box").innerHTML = "";
        document.getElementById(item + "_200_box").innerHTML = "";
        current_cash.forEach(element => {
            this.create_cash(item, element);
        });
    }

    add_cash(obj, value, item_id) {
        //console.log(obj);
        //console.log("Adding cash: " + value);
        switch (item_id) {
            case "cashgiven_menu":
                this.cash_given_value = parseFloat(this.cash_given_value) + parseFloat(value);
                this.cash_given_value = parseFloat(this.cash_given_value).toFixed(2);
                this.calculateChange();
                break;

            case "cashbox_menu":
                this.cashbox_value = parseFloat(this.cashbox_value) + parseFloat(value);
                this.cashbox_value = parseFloat(this.cashbox_value).toFixed(2);
                this.cashbox_item.append(value);
                break;
        }
        console.log("CASHBOX: " + this.cashbox_value + " - " + "CASHGIVEN: " + this.cash_given_value);
        this.create_cash(item_id, value);
    }

    remove_cash(obj, value, money_place) {
        obj.remove();
        let money_buffer = 0;
        switch (money_place) {
            case "cashbox_menu":
                money_buffer = this.cashbox_value;
                break;
            case "cashgiven_menu":
                money_buffer = this.cash_given_value;
                break;
        }
        money_buffer = parseFloat(money_buffer) - parseFloat(value);
        money_buffer = parseFloat(money_buffer).toFixed(2);
        //console.log("Removed from " + money_place + " :" + money_buffer);
        switch (money_place) {
            case "cashbox_menu":
                this.cashbox_value = money_buffer;
                break;
            case "cashgiven_menu":
                this.cash_given_value = money_buffer;
                this.calculateChange();
                break;
        }
        console.log("CASHBOX: " + this.cashbox_value + " - " + "CASHGIVEN: " + this.cash_given_value);
    }

    calculateChange() {
        this.new_cashbox_item = this.cashbox_item.slice();
        let change = this.cash_given_value - this.to_paid;
        console.log("We need to give :" + change);
        let state = "error";
        let result = [];
        document.getElementById("cashgiven_label").innerHTML = "Monnaie à rendre";
        if (change == 0) {
            state = "nochange";
        } else if (change < 0) {
            console.log("No change to give");
            state = "noenoughcash";
        } else {
            if (this.cashbox_value >= change) {
                for (let i = 0; i < this.cashbox_item.length; i++) {
                    let coin = this.cashbox_item[i];
                    if (change >= coin) {
                        result.push(coin);
                        change -= coin;
                    }
                }
                if (change != 0) {
                    document.getElementById("cashgiven_label").innerHTML = "Monnaie à rendre : ❌ Monnaie non disponible faites le point";
                    state = "no correct cash";
                    result = [];
                } else {
                    for (let i = 0; i < result.length; i++) {
                        let coinIndex = this.new_cashbox_item.indexOf(result[i]);
                        if (coinIndex !== -1) {
                            this.new_cashbox_item.splice(coinIndex, 1);
                        }
                    }
                    state = "ok";

                    //this.fill_cash("cashbox", this.new_cashbox_item);
                }
            } else {
                document.getElementById("cashgiven_label").innerHTML = "Monnaie à rendre : ❌ Pas accès d'argent dans la caisse";
                state = "no enough cash in cashbox";
            }
        }
        this.fill_cash("cash_to_give_menu", result);
        return {
            state: state,
            result: result
        };
    }
}
