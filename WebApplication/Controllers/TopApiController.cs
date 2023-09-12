using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using garmit.Web.Filter;

namespace garmit.Web.Controllers
{
    /// <summary>
    /// サンドボックスのAPIコントローラ
    /// </summary>
    [SessionExpireApiFilter]
    [RoutePrefix("api/top")]
    public class TopApiController : ApiController
    {
        
    }
}
