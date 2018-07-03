
function isAdminUser(){

  return true;
}

function getKey(CompanyID,UserName,Password){
  var blob = Utilities.newBlob(CompanyID+":"+UserName+":"+Password);
  var encoded = Utilities.base64Encode(blob.getBytes());
  
  var headers = {
    'Authorization': "Basic "+encoded,
    'Content-Type':'application/json; charset=UTF-8'
  };
  
  var data = {
  };
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data),
    'headers' : headers
  };
  
  var response = UrlFetchApp.fetch('https://easylink.easyclocking.net/api/sekureid/external/login', options);
  //API_KEY=response.getAllHeaders()['x-accesstoken'];
  
  PropertiesService.getScriptProperties().setProperty('API_KEY',API_KEY=response.getAllHeaders()['x-accesstoken']);

  console.log(response.getAllHeaders()['x-accesstoken']);

}

function getConfig(request) {
  
  console.log("getConfig() started:");
  var config = {
    configParams: [
      {
                name: 'CompanyID',
                displayName: 'Company ID',
                helpText: 'Please provide your company ID that you got during registration',
                placeholder: '123456'
            }, {
                name: 'UserName',
                displayName: 'Username',
                helpText: 'Please provide your username that you use during login',
                placeholder: 'Enter UserName Here'
            }, {
                name: 'Password',
                displayName: 'Password',
                helpText: 'This place is for password used for login',
                placeholder: 'Enter Password Here'
            }
    ],
    dateRangeRequired: false
    
  };
  
  console.log("getConfig() Ended:");
  return config;
};

var DepartmentSchema = [
  {
    name: 'departmentCode',
    label: 'Department Code',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'departmentName',
    label: 'Department Name',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'correlationID',
    label: 'Correlation ID',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  }
];

function getSchema(request) {
  
  console.log("Get Schema");
   
  if (request.configParams.CompanyID ==='') {
      throw new Error(
        'DS_USER:Enter CompanyID'
      );
   }
  if (request.configParams.UserName ==='') {
      throw new Error(
        'DS_USER:Enter User Name'
      );
   }
  if (request.configParams.Password ==='') {
      throw new Error(
        'DS_USER:Enter Password'
      );
   }
  
  getKey(request.configParams.CompanyID,request.configParams.UserName,request.configParams.Password);
  
  return {schema: DepartmentSchema};
};

function getData(request) {
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < DepartmentSchema.length; i++) {
      if (DepartmentSchema[i].name === field.name) {
        dataSchema.push(DepartmentSchema[i]);
        break;
      }
    }
  });

  console.log("Get Data");
  
  //Request to get departments
  var headers = {
    'x-accesstoken':  PropertiesService.getScriptProperties().getProperty('API_KEY')
  };
  
  var options = {
    'method' : 'get',
    'headers' : headers
  };
  
  console.log("API_KEY_USEF"+ PropertiesService.getScriptProperties().getProperty('API_KEY'))
  var response = UrlFetchApp.fetch('https://easylink.easyclocking.net/api/sekureid/external/Department', options);
  console.log(response);
  
  
  if(response.getResponseCode()!=200){
    getKey(request.configParams.CompanyID,request.configParams.UserName,request.configParams.Password);
    response = UrlFetchApp.fetch('https://easylink.easyclocking.net/api/sekureid/external/Department', options);
    console.log(response);
    getData(request);
  }
  
  var response = JSON.parse(response.getContentText());

  var data = [];
  response.forEach(function(department) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'departmentCode':
          values.push(department.departmentCode);
          break;
        case 'departmentName':
          values.push(department.departmentName);
          break;
        case 'correlationID':
          values.push(department.correlationID);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
};

function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
}

