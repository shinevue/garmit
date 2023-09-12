using garmit.Core;
using garmit.DomainObject;
using garmit.Service.WebApplicationService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;


namespace garmit.Web.Controllers
{
    ///// <summary>
    ///// サンドボックスのAPIコントローラ
    ///// </summary>
    //[RoutePrefix("api/sample")]
    //public class SampleApiController : ApiController
    //{
    //    /// <summary>
    //    /// サンプルサービス
    //    /// </summary>
    //    public ISampleInfoService SampleService { get; set; }

    //    /// <summary>
    //    /// コンストラクタ
    //    /// </summary>
    //    public SampleApiController()
    //    {
    //        SampleService = ServiceManager.GetService<ISampleInfoService>("SampleInfoService");
    //    }

    //    /// <summary>
    //    /// GET受信のサンプル
    //    /// </summary>
    //    /// <returns></returns>
    //    [Route("")]
    //    public SampleInfo Get()
    //    {
    //        SampleInfo info = new SampleInfo();

    //        if (SampleService != null)
    //        {
    //            info = SampleService.GetSampleInfo();
    //        }

    //        return info;
    //    }

    //    /// <summary>
    //    /// メッセージを追加する
    //    /// </summary>
    //    /// <returns></returns>
    //    [Route("add")]
    //    public bool AddMessage(SampleItem item)
    //    {
    //        bool result = false;

    //        if (SampleService != null)
    //        {
    //            result = SampleService.SetSampleItem(item);
    //        }

    //        return result;
    //    }

    //    /// <summary>
    //    /// POST受信サンプル
    //    /// </summary>
    //    /// <param name="sampleItems"></param>
    //    /// <returns></returns>
    //    [Route("")]
    //    public string Post(IEnumerable<SampleItem> sampleItems)
    //    {
    //        return sampleItems.Count().ToString() + "件（POS受信）";
    //    }
        
    //}
}
