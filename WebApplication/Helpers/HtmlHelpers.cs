using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Web;
using System.Web.Mvc;

namespace garmit.Web.Helpers
{
    public static class HtmlHelpers
    {
        /// <summary>
        /// ViewBagオブジェクトをJSONに変換する
        /// </summary>
        /// <param name="viewBagObject">JSONにするオブジェクト</param>
        /// <returns>Javascriptオブジェクト</returns>
        public static IHtmlString ToJson(HtmlHelper html, dynamic viewBagObject)
        {
            var json = JsonConvert.SerializeObject(
                viewBagObject,
                Formatting.Indented,
                new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() }
            );

            return html.Raw(json);
        }
    }
}