using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class ICCardQueryParameter
    {
        /// <summary>
        /// 検索条件（共通）
        /// </summary>
        public LookUp LookUp { get; set; }

        /// <summary>
        /// ICカード検索条件
        /// </summary>
        public ICCardCondition ICCardCondition { get; set; }
    }
}