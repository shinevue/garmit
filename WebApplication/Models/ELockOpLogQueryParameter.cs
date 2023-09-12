using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class ELockOpLogQueryParameter
    {
        /// <summary>
        /// 検索条件
        /// </summary>
        public LookUp LookUp { get; set; }

        /// <summary>
        /// 開錠を検索するかどうか
        /// </summary>
        public bool IsUnlockSearch { get; set; }

        /// <summary>
        /// 施錠を検索するかどうか
        /// </summary>
        public bool IsLockSearch { get; set; }

        /// <summary>
        /// ICカード検索条件
        /// </summary>
        public ICCardCondition ICCardCondition { get; set; }

        /// <summary>
        /// カード操作条件かどうか
        /// </summary>
        public bool IsCardOperation { get; set; }
    }
}