var API_KEY = "YOUR_API_KEY";

function isAdminUser(){

  return true;
}

function getConfig(request) {
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
    ]
  };
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

  var url = [
    'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily)&key=',
    API_KEY];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).items;

  var data = [];
  response.forEach(function(font) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'family':
          values.push(font.family);
          break;
        case 'category':
          values.push(font.category);
          break;
        case 'count':
          values.push(1);
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

