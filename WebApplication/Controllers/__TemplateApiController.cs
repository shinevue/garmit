using garmit.Core;
using garmit.DomainObject;
using garmit.Web.Accessor;
using garmit.Web.Filter;
using garmit.Web.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web.Http;
using garmit.Service.Project;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// APIコントローラのテンプレート
    /// 
    /// TODO："__Template"を修正する
    /// TODO：apiのURLのxxxを修正する
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/abc")]
    public class AbcApiController : ApiController
    {

        /// <summary>
        /// XXXサービス
        /// 
        /// TODO：XXXを修正する。
        /// 　　　下記のコメントを外す
        /// </summary>
        //public IXXXService XXXService { get; set; }

        // TODO："__Template"を修正する
        // TODO：XXXを修正する。
        // TODO：新しいサービスを作成した際は、Global.asaxのRegisterServices()で該当サービスを登録することを忘れずに！
        //public __TemplateApiController()
        //{
        //    XXXService = ServiceManager.GetService<IXXXService>("XXXService");
        //}
    }
}
