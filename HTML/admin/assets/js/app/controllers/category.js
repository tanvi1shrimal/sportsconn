/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// IP Controller
app.controller('CategoryCtrl', function ($scope, $rootScope, categoryData, $window, $timeout) {
    $scope.totalRecord = 0;
    $scope.currentPage = 1,
    $scope.numPerPage = pagination,
    $scope.maxSize = pagination_links;
    $scope.orderByField = '';
    $scope.reverseSort = false;
    $rootScope.totalIps = 0;
    $scope.isDefaultIP = 0;
    //$scope.IpFor = 1;
    $scope.pageHeading = Category;
    $scope.globalChecked = false;
    $scope.IpStatus = {};
    $scope.ip_status = 2;
    $scope.currentData = {};
    $scope.currentIsActive = 0;
    $scope.allCategories = {};
    $scope.ModuleID = "";
    $scope.DataList = function (searchBtn) {
        if(searchBtn != undefined ){
            if(!openSearch() || $scope.SearchKeyword==undefined){
                return;
            }
        }
        intilizeTooltip();
        showLoader();

        //get starting date and end date from top selected date and apply in query
        $scope.startDate = $('#SpnFrom').val();
        $scope.endDate = $('#SpnTo').val();

        /* Here we check if current page is not equal 1 then set new value for var begin */
        var begins = '';
        if ($scope.currentPage == 1) {
            //Make request data parameter for smtp listing
            begins = 0;//$scope.currentPage;
        } else {
            begins = (($scope.currentPage - 1) * $scope.numPerPage)
        }

        /* Send AdminLoginSessionKey in every request */
        $scope.AdminLoginSessionKey = $('#AdminLoginSessionKey').val();

        var reqData = {
            Begin: begins, //$scope.currentPage,
            End: $scope.numPerPage,
            SortBy: $scope.orderByField,
            OrderBy: $scope.reverseSort,
            //IpFor: $scope.IpFor,
            ModuleID:$scope.ModuleID,
            SearchKeyword:$scope.SearchKeyword,
            //Send AdminLoginSessionKey
            //AdminLoginSessionKey: $scope.AdminLoginSessionKey
        }

        //Call getIpList in services.js file
        categoryData.getList(reqData).then(function (response) {
            $scope.listData = [];
            $("#ipdenieddiv").html('');
            if (response.ResponseCode == 200) {
                $scope.totalRecord = $scope.noOfObj = response.Data.total_records

                $rootScope.totalResults = $scope.noOfObj;

                //If no. of records greater then 0 then show            
                $('#noresult_td').remove();
                $('.simple-pagination').show();

                //If no of records equal 0 then hide
                if ($scope.noOfObj == 0) {
                    $('#CategoryCtrl table>tbody').append('<tr id="noresult_td"><td colspan="3"><div class="no-content text-center"><p>' + ThereIsNoCategoryToShow + '</p></div></td></tr>');
                    $('.simple-pagination').hide();
                }

                //Push data into Controller in view file
                $scope.listData.push({ObjIP: response.Data.results});
                //$scope.getAllCategories();
            } else if (response.ResponseCode == 517) {
                redirectToBlockedIP();
            } else if (response.ResponseCode == 598) {
                //Show error message
                PermissionError(response.Message);
                $("#ipdenieddiv").html(response.DeniedHtml);
            }

            hideLoader();

        }), function (error) {
            hideLoader();
        }
    };
    //Apply Sort by and mamke request data
    $scope.sortBY = function (column_id) {
        if ($("table.users-table #noresult_td").length == 0)
        {
            $(".shortdiv").children('.icon-arrowshort').addClass('hide');
            $(".shortdiv").parents('.ui-sort').removeClass('selected');
            if ($scope.reverseSort == true) {
                $("#" + column_id).addClass('selected').children('.shortdiv').removeClass('sortedDown').addClass('sortedUp').children('.icon-arrowshort').removeClass('hide');
            } else {
                $("#" + column_id).addClass('selected').children('.shortdiv').removeClass('sortedUp').addClass('sortedDown').children('.icon-arrowshort').removeClass('hide');
            }
            reqData = {
                Begin: $scope.currentPage,
                End: $scope.numPerPage,
                SortBy: $scope.orderByField,
                OrderBy: $scope.reverseSort,
                //Send AdminLoginSessionKey
                //AdminLoginSessionKey: $scope.AdminLoginSessionKey
            }
            $scope.DataList();
        }
    };
    //Get no. of pages for data
    $scope.numPages = function () {
        return Math.ceil($scope.noOfObj / $scope.numPerPage);
    };
    //Call function for get pagination data with new request data
    $scope.$watch('currentPage + numPerPage', function () {
        begins = (($scope.currentPage - 1) * $scope.numPerPage)
        reqData = {
            Begin: begins,
            End: $scope.numPerPage,
            SortBy: $scope.sort_by,
            ModuleID:$scope.ModuleID,
            //Send AdminLoginSessionKey
            //AdminLoginSessionKey: $scope.AdminLoginSessionKey
        }
        $scope.DataList();
    });
    //Function for set class for each TR
    $scope.cls = function (idx) {
        return idx % 2 === 0 ? 'odd' : 'even';
    };

    //Function for set Ip details in scope variables
    $scope.SetDetail = function (data) {
        $scope.currentData = data;
        console.log($scope.currentData);
    };

    $scope.resetPopup = function () {
        $scope.currentData = {'category_id': "", "name": "", "parent_id": "0", "module_id": "","description":""};
       // $('#attached-media-1').children().find('li').removeAttr('id');
    }

    $scope.getAllCategories = function (category_id) {
        if (typeof category_id == 'undefined') {
            category_id = '';
        }
        reqData = {
            ModuleID:$scope.ModuleID,
            //AdminLoginSessionKey: $scope.AdminLoginSessionKey,
            CategoryId: category_id
        }
        categoryData.getAllCategory(reqData).then(function (response) {
            if (response.ResponseCode == 200) {
                $scope.allCategories = response.Data.results;
                $scope.currentData.parent_id = $scope.allCategories[0];
            }
        });
    }

    $scope.AddDetailsPopUp = function () {
        $scope.getAllCategories();
       // $('#attached-media-1 li').remove();
        $scope.resetPopup();
        $("#chkActive").attr('checked', true).parent('span').addClass('icon-checked');
        $scope.showIpError = false;
        $scope.errorIpMessage = null;
        $scope.showCategoryError = false;
        $scope.showDescriptionError = false;
        openPopDiv('addIpPopup', 'bounceInDown');
    };

    $scope.EditDetailsPopUp = function () {
        
        //$scope.getAllCategories();
        reqData = {
            ModuleID: 14,
            //AdminLoginSessionKey: $scope.AdminLoginSessionKey,
            CategoryId: $scope.currentData.category_id
        }
        showLoader();
        categoryData.getAllCategory(reqData).then(function (response) {
            if (response.ResponseCode == 200) {
                $scope.allCategories = response.Data.results;
                $scope.set_parent_selected($scope.currentData.parent_id);
                $scope.currentData.module_id = $scope.currentData.ModuleID;
            }
            //console.log($scope.allCategories);
            $scope.showIpError = false;
            $scope.errorIpMessage = null;
            $scope.showCategoryError = false;
            $scope.showDescriptionError = false;
            openPopDiv('addIpPopup', 'bounceInDown');
            hideLoader();
        });

    };

    $scope.filter_module = function()
    {
        $scope.ModuleID = $scope.category.filter_module;
        $scope.DataList();
    }
    
    $scope.clearCategorySearch = function()
    {
        if($scope.SearchKeyword!==undefined && $scope.SearchKeyword!==''){
            $scope.SearchKeyword = '';
            $scope.DataList();
        }
    }
    
    
    
    

    $scope.set_parent_selected = function (category_id) {
        if (category_id == null || category_id == 0) {
            $scope.currentData.parent_id = $scope.allCategories[0];
        }else{
            //console.log(category_id,$scope.allCategories);
            angular.forEach($scope.allCategories, function(val, index){
                if(val.category_id==category_id){
                    $scope.currentData.parent_id = $scope.allCategories[index];
                }
            });
        }
    }

    $scope.AddEditCategory = function () {
        var CategoryName = $scope.currentData.name;
        var Description = $scope.currentData.description;
        var module_id = $scope.currentData.module_id;
        var media_guid = $('.img-category-full').attr('media_guid');
        var media_name = $('.img-category-full').attr('media_name');
        if(media_guid==undefined){
            media_guid='';
        }
        var show_error = 0;
        $scope.hasError = false;
        $scope.errorCategoryMessage = '';
        $scope.errorModuleMessage = '';
        $scope.errorDescriptionMessage = '';
        if (CategoryName == "") {
            $scope.showCategoryError = true;
            $scope.errorCategoryMessage = 'Please enter valid category name.';
            $scope.hasError = true;
        }
        if (module_id == "" || module_id == undefined) {
            $scope.showModuleError = true;
            $scope.errorModuleMessage = 'Please select module name.';
            $scope.hasError = true;
        }
        if(Description == "" || Description == undefined) {
            $scope.showDescriptionError = true;
            $scope.errorDescriptionMessage = 'Please enter description.';
            $scope.hasError = true;
        }
        //console.log($scope.hasError);
        if($scope.hasError==true)
        {
            return false;
        }

        else 
        {
            $('.loader_ip').show();
            //send message
            $scope.showCategoryError = false;
            $scope.errorCategoryMessage = null;
            $scope.showDescriptionError = false;
            $scope.errorDescriptionMessage = null;
            var reqData = {
                //'CommisionGUID':$scope.currentCommission.CommisionGUID,
                'CategoryID': $scope.currentData.category_id,
                'Name': $scope.currentData.name,
                'Description': $scope.currentData.description,
                'ParentCategoryID': $scope.currentData.parent_id.category_id,
                'ModuleID': module_id,
                'MediaGUID': media_guid,
                'AdminLoginSessionKey': $scope.AdminLoginSessionKey
            };
            if($scope.currentData.category_id){
                reqData.Url='admin_api/category/edit';
            }else{
                reqData.Url='admin_api/category/add';
            }
            categoryData.Save(reqData).then(function (response) {
                if (response.ResponseCode == 200) {
                    //Show Success message
                    ShowSuccessMsg(response.Message);
                    $scope.resetPopup();
                    $scope.DataList();
                    closePopDiv('addIpPopup', 'bounceOutUp');
                } else if (response.ResponseCode == 517) {
                    redirectToBlockedIP();
                } else if (response.ResponseCode == 598) {
                    //Show error message
                    closePopDiv('addIpPopup', 'bounceOutUp');
                    PermissionError(response.Message);
                } else {
                    $scope.showCategoryError = true;
                    $scope.errorCategoryMessage = response.Message;
                    //$scope.showDescriptionError = true;
                    //$scope.errorDescriptionMessage = response.Message;
                }
                $('.loader_ip').hide();
            });
        }

        $timeout(function () {
            $scope.showIpError = false;
            $scope.errorIpMessage = null;
        }, 5000);

    };


    $scope.SetStatus = function (action) {
        if (action == 2) {
            $rootScope.confirmationMessage = Sure_Active + ' ?';
        } else if (action == 4) {
            $rootScope.confirmationMessage = Sure_Inactive + ' ?';
        } else if (action == 3) {
            $rootScope.confirmationMessage = Sure_Delete + ' ?';
        }
        $scope.currentIsActive = action;
        openPopDiv('confirmeCommissionPopup', 'bounceInDown');
    };

    $rootScope.updateStatus = function () {
        showLoader();
        var reqData = {
            'StatusID': $scope.currentIsActive,
            'CategoryID': $scope.currentData.category_id,
            'AdminLoginSessionKey': $scope.AdminLoginSessionKey
        };
        //console.log(reqData)
        closePopDiv('confirmeCommissionPopup', 'bounceOutUp');
        showLoader();
        categoryData.updateStatus(reqData).then(function (response) {
            if (response.ResponseCode == 200)
            {
                hideLoader();
                ShowSuccessMsg(response.Message);
                $scope.DataList();

            } else if (response.ResponseCode == 517) {
                redirectToBlockedIP();
            } else if (response.ResponseCode == 598) {
                //Show error message
                PermissionError(response.Message);
            } else {
                ShowErrorMsg(response.Message);
            }
            hideLoader();
            $("html, body").animate({scrollTop: 0}, "slow");

        }), function (error) {
            hideLoader();
        }
    };
    
    $scope.delete_cat_image = function(MediaGUID){
        //$('#cat_img_'+MediaGUID).remove();
        $scope.currentData.MediaGUID='';
        $scope.currentData.ImageName='';
    }

});

app.filter('htmlString', function () {
    return function (text) {
        return text.replace(/&nbsp;/g, " ");
    }
});

app.directive('fineUploader', function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    scope: {model:'='},
    replace: false,
    link: function($scope, element, attributes, ngModel) {
      var serr = 1;
      $scope.uploader = new qq.FineUploader({
        element: element[0],
        multiple: false,
        title: "Attach a Photo",
        request: {
          endpoint: base_url + "api/upload_image",
            params: {
                Type: attributes.sectionType,
                unique_id: function() {
                    return '';
                },
                LoginSessionKey:$('#AdminLoginSessionKey').val(),
                DeviceType:'Native'
            }
        },
        validation: {
          allowedExtensions: attributes.uploadExtensions.split(',')
        },
        failedUploadTextDisplay: {
            mode: 'none'
        },
        callbacks: {
            onUpload: function(id, fileName) {
               // var html = "<li id='dummy_img'><div class='loader-box'><div id='ImageThumbLoader' class='uplaodLoader'><img src='"+base_url+"assets/admin/img/loading22.gif' id='spinner'></div></div></li>";
                //$('#attached-media-'+$(element).attr('unique-id')).html(html);
            },
            onProgress: function(id, fileName, loaded, total) {
            },
            onComplete: function(id, fileName, responseJSON) { 
                if(responseJSON.Message == 'Success') 
                {
                    if($(element).attr('image-type')=="landscape")
                    {
                        $('#attached-media-'+$(element).attr('unique-id')).html("<label>"+responseJSON.Data.ImageName+"</label>");
                    }
                    else
                    {
                        var CategoryCtrl = angular.element('#CategoryCtrl').scope();
                        
                        CategoryCtrl.$apply(function(){
                            CategoryCtrl.currentData.ImageName = responseJSON.Data.ImageName;
                            CategoryCtrl.currentData.MediaGUID = responseJSON.Data.MediaGUID;
                        });
                        /*click_function = 'remove_image("'+responseJSON.Data.MediaGUID+'");';
                        var html = "<li id='"+responseJSON.Data.MediaGUID+"'><a class='smlremove' onclick='"+click_function+"'></a>";
                            html+= "<figure><img alt='' width='98px' class='img-"+$(element).attr('image-type')+"-full' media_type='IMAGE' is_cover_media='0' media_name='"+responseJSON.Data.ImageName+"' media_guid='"+responseJSON.Data.MediaGUID+"' src='"+responseJSON.Data.ImageServerPath +'/220x220/'+responseJSON.Data.ImageName+"'></figure>";
                            html+= "<span class='radio'></span></li>";

                        $('#attached-media-'+$(element).attr('unique-id')).html(html);
                        var $items = $('.img-full');*/
                    }
                } 
                else if(responseJSON.ResponseCode !== 200)
                {
                   $('#attached-media-'+$(element).attr('unique-id')).html("");
                }
             },
            onValidate: function(b)
            {
                var allowed_extension = $(element).attr('upload-extensions');
                var temp              = new Array();
                validExtensions       = allowed_extension.split(",");
                var fileName          = b.name;
                var fileNameExt       = fileName.substr(fileName.lastIndexOf('.') + 1);
                if($.inArray(fileNameExt, validExtensions) == -1) 
                {
                    $("html, body").animate({ scrollTop: 0 }, "slow");
                    if($(element).attr('image-type')=="landscape")
                    {
                        PermissionError('Allowed file types only doc, docx, pdf and xls.');
                    }
                    else
                    {
                        PermissionError('Allowed file types only jpeg, jpg, gif and png.');
                    }
                    return false;
                }
            },
            onError: function(){
               $('#cm-'+attributes.uniqueId+' .loading-class').remove();
            }
        },
        showMessage: function(message){
            //showResponseMessage(message,'alert-danger');
        },
        text: {
            uploadButton: '<i class="icon-upload icon-white"></i> Upload File(s)'
        },       
        template:  ' <a class="qq-upload-button"  title="Attach a Photo"><button>Upload</button></a><span class="qq-drop-processing qq-upload-drop-area" style="display:none;"></span>' +
            '<ul class="qq-upload-list" style="display:none;margin-top: 10px; text-align: center;"></ul>',
        chunking: {
          //enabled: false
          //onclick=$(\'#cmt-'+attributes.uniqueId+'\').trigger(\'focus\');
        }
      });
    }
  };
});


app.directive('enterPress', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.enterPress);
                });

                event.preventDefault();
            }
        });
    };
});

function remove_image(MediaGUID){
    $('#'+MediaGUID).remove();
}