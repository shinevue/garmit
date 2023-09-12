using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    public class LineHistQueryParameter
    {
        /// <summary>
        /// 履歴IDリスト
        /// </summary>
        public IEnumerable<int> HistIds { get; set; }

        /// <summary>
        /// 履歴メモ
        /// </summary>
        public string Appendix { get; set; }

        /// <summary>
        /// メモを保存するかどうか
        /// </summary>
        public bool IsSaveAppendix { get; set; }

        /// <summary>
        /// 誤登録フラグ
        /// </summary>
        public bool MisReg { get; set; }

        /// <summary>
        /// 誤登録を保存するかどうか
        /// </summary>
        public bool IsSaveMisReg { get; set; }

    }
}