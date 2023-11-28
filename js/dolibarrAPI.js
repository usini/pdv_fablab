class DolibarrAPI {
  constructor(url) {
    this.url = url;
    this.dolapikey = null;
    this.connected = false;
    this.apiroute = "/api/index.php/";
    this.selectedClient = {}
    this.selectedInvoice = 0;
    this.usersList = [];
    this.user = {
      name: "Non identifié",
      id: -1
    };
    this.products = [];
  }

  createOptions(method = "get", body = null) {

    const headers = {
      'DOLAPIKEY': this.dolapikey,
      'Content-Type': 'application/json'
    };

    var requestOptions = {
      method: method,
      headers: headers,
      body: body
    }
    return requestOptions;
  }

  // Remplacez ces valeurs par vos informations d'authentification
  async getClient(username) {
    var requestOptions = this.createOptions();
    const route = `thirdparties?sortfield=t.rowid&sortorder=ASC&limit=100&sqlfilters=(t.nom%3Alike%3A'%25${username}%25')`;

    try {
      const response = await fetch(this.url + this.apiroute + route, requestOptions);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      this.usersList = data.filter(function (element) {
        return element.fournisseur !== "1";
      });
      return this.usersList;
    } catch (error) {
      console.error(error);
      return null; // Retourne null en cas d'erreur
    }
  }

  async setClient(user) {
    var found = false;
    this.usersList.forEach(element => {
      //console.log(`"${element.name.toUpperCase()}" == "${user.toUpperCase()}"`);
      if (element.name.toUpperCase() == user.toUpperCase()) {
        //console.log("found");
        this.selectedClient.name = element.name;
        this.selectedClient.id = element.id;
        found = true;
        return this.selectedClient;
      }
    });
    if (found) {
      return this.selectedClient;
    } else {
      return false;
    }
  }
  //https://github.com/Dolibarr/dolibarr/issues/6811
  async createInvoice() {
    var body = JSON.stringify({
      "socid": this.selectedClient.id
    })
    var requestOptions = this.createOptions("post", body);
    const route = "invoices"
    const response = await fetch(this.url + this.apiroute + route, requestOptions)
    if (response.ok) {
      var data = await response.json();
      console.log(data);
      this.selectedInvoice = data;
      return data;
    } else {
      return false;
    }
  }

  async testServer(server_url) {
    const route = "explorer";
    console.log(server_url + this.apiroute + route);
    try {
      const response = await fetch(server_url + this.apiroute + route);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.text();
      //console.log(data);
      if (data.includes("DOLAPIKEY")) {
        //console.log("Server with API founded");
        return true;
      } else {
        return false;
      }

    } catch (error) {
      console.error("ERROR: " + error);
      return false; // Retourne false en cas d'erreur
    }
  }

  async getUser(id) {
    var requestOptions = this.createOptions();
    const route = `users/` + id;

    try {
      const response = await fetch(this.url + this.apiroute + route, requestOptions);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      this.user = {
        "name": data.firstname + " " + data.lastname,
        "id": id
      }
      return this.user;
    } catch (error) {
      console.error(error);
      return null; // Retourne null en cas d'erreur
    }
  }

  async login(apikey) {
    var check_id = apikey.split("???")
    if(check_id.length == 1){
      console.log("NO ID")
      this.dolapikey = apikey;
    } else {
      this.dolapikey = check_id[0];
      var id = check_id[1]
      await this.getUser(id);
    }
    var requestOptions = this.createOptions();
    const response = await fetch(this.url + this.apiroute + "status", requestOptions);
    console.log(response);
    if (response.status == 401) {
      this.dolapikey = null;
      return false;
    } else {
      const data = await response.json();
      console.log(data);
      return true;
    }
  }

}

